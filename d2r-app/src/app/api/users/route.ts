import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { readSeedStore, writeSeedStore } from '@/lib/store';
import type { SeedUser } from '@/lib/data';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = readSeedStore<{ users: SeedUser[] }>('users.json', { users: [] });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const email = String(body.email || '')
    .toLowerCase()
    .trim();
  const name = String(body.name || email.split('@')[0] || 'User');
  const role = String(body.role || 'rep');
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }
  const data = readSeedStore<{ meta?: unknown; users: SeedUser[] }>('users.json', {
    users: [],
  });
  const existing = (data.users || []).findIndex((u) => u.email === email);
  const row: SeedUser = { email, name, role };
  if (existing >= 0) data.users[existing] = row;
  else data.users = [...(data.users || []), row];
  writeSeedStore('users.json', data);
  return NextResponse.json({ ok: true, user: row });
}
