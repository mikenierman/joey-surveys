#!/usr/bin/env node
/**
 * Geocode US Circle K addresses via Census Bureau batch API and write lat/lng
 * back into public/data/stores.json.
 *
 *   node scripts/geocode-stores.cjs
 *
 * Safe to re-run: stores that already have lat/lng are skipped.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..');
const storesPath = path.join(root, 'public/data/stores.json');
const BATCH = 900; // Census allows up to 10,000; keep chunks smaller
const ENDPOINT =
  'https://geocoding.geo.census.gov/geocoder/locations/addressbatch?benchmark=Public_AR_Current&vintage=Current_Current';

function postMultipart(boundary, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(ENDPOINT);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode >= 400) {
            reject(new Error(`Census ${res.statusCode}: ${text.slice(0, 200)}`));
            return;
          }
          resolve(text);
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildBatchCsv(rows) {
  // Unique ID, Street address, City, State, ZIP
  return rows
    .map((r) =>
      [r.id, r.street, r.city, r.state, r.zip]
        .map((v) => `"${String(v || '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
}

function parseCensusResponse(text) {
  // Returns map id -> { lat, lng, match }
  const out = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    // CSV can contain quoted commas — simple split for Census format:
    // id, "input address", Match/No_Match, Match type, "matched address", lon,lat, tiger..., ...
    const cols = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === ',' && !inQ) {
        cols.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    cols.push(cur);
    const id = cols[0];
    const match = (cols[2] || '').trim();
    const coord = (cols[5] || '').trim(); // "lon,lat"
    if (match === 'Match' && coord.includes(',')) {
      const [lngStr, latStr] = coord.split(',');
      const lng = Number(lngStr);
      const lat = Number(latStr);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        out.set(String(id), { lat, lng, match: true });
      }
    } else {
      out.set(String(id), { match: false });
    }
  }
  return out;
}

async function geocodeChunk(rows) {
  const csv = buildBatchCsv(rows);
  const boundary = `----joey${Date.now()}`;
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="addressFile"; filename="addresses.csv"\r\n` +
    `Content-Type: text/csv\r\n\r\n` +
    `${csv}\r\n` +
    `--${boundary}--\r\n`;
  const text = await postMultipart(boundary, body);
  return parseCensusResponse(text);
}

(async () => {
  const stores = JSON.parse(fs.readFileSync(storesPath, 'utf8'));
  const need = [];
  stores.forEach((s, idx) => {
    const has =
      Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng));
    if (!has) {
      need.push({
        idx,
        id: String(idx),
        street: s.address || '',
        city: s.city || '',
        state: s.state || '',
        zip: s.zip || '',
      });
    }
  });

  console.log(`Stores: ${stores.length}. Need geocode: ${need.length}.`);
  if (need.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  let matched = 0;
  let missed = 0;
  for (let i = 0; i < need.length; i += BATCH) {
    const chunk = need.slice(i, i + BATCH);
    process.stdout.write(
      `  Batch ${i + 1}-${i + chunk.length} / ${need.length}… `
    );
    let result;
    try {
      result = await geocodeChunk(chunk);
    } catch (e) {
      console.error(`failed: ${e.message}`);
      // brief pause and retry once
      await new Promise((r) => setTimeout(r, 2000));
      result = await geocodeChunk(chunk);
    }
    for (const row of chunk) {
      const hit = result.get(row.id);
      if (hit?.match) {
        stores[row.idx].lat = hit.lat;
        stores[row.idx].lng = hit.lng;
        matched++;
      } else {
        missed++;
      }
    }
    console.log(`ok (matched so far ${matched})`);
    await new Promise((r) => setTimeout(r, 500));
  }

  fs.writeFileSync(storesPath, JSON.stringify(stores));
  console.log(`Done. Matched ${matched}, unmatched ${missed}. Wrote ${storesPath}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
