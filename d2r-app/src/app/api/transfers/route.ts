import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const seedPath = path.join(process.cwd(), 'data', 'seed', 'transfers.json');
  let transfers: unknown[] = [];
  if (fs.existsSync(seedPath)) {
    try {
      transfers = JSON.parse(fs.readFileSync(seedPath, 'utf8')).transfers || [];
    } catch {
      transfers = [];
    }
  }
  const row = {
    id: `tr-${Date.now()}`,
    from: String(body.from || ''),
    to: String(body.to || ''),
    sku: String(body.sku || ''),
    qty: Number(body.qty || 0),
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10),
    createdBy: user.email,
  };
  transfers = [row, ...transfers];
  fs.writeFileSync(seedPath, JSON.stringify({ transfers }, null, 2));
  return NextResponse.json({ ok: true, transfer: row });
}
