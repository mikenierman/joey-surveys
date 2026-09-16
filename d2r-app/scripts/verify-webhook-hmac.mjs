#!/usr/bin/env node
/**
 * Signs a sample Shopify webhook body and verifies HMAC the same way as the API route.
 * Usage: node scripts/verify-webhook-hmac.mjs [secret]
 */
import crypto from 'crypto';

const secret = process.argv[2] || process.env.SHOPIFY_WEBHOOK_SECRET || 'test-webhook-secret';
const body = JSON.stringify({
  id: 12345,
  sku: 'ALP-12MG-WK',
  available: 42,
});

function sign(raw, key) {
  return crypto.createHmac('sha256', key).update(raw).digest('base64');
}

function verify(raw, hmacHeader, key) {
  if (!key || !hmacHeader) return false;
  const digest = sign(raw, key);
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const good = sign(body, secret);
const bad = sign(body, 'wrong-secret');

const passGood = verify(body, good, secret) === true;
const passBad = verify(body, bad, secret) === false;
const passTamper = verify(body + 'x', good, secret) === false;

console.log('secret length:', secret.length);
console.log('hmac sample:', good.slice(0, 16) + '…');
console.log('valid signature accepted:', passGood);
console.log('wrong secret rejected:', passBad);
console.log('tampered body rejected:', passTamper);

if (passGood && passBad && passTamper) {
  console.log('OK — HMAC verify helper behavior matches route expectations');
  process.exit(0);
}

console.error('FAIL — verify behavior incorrect');
process.exit(1);
