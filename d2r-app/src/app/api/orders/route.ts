import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { LIVE_ORDER_HEADERS, type LiveOrderRow } from '@/lib/data';
import { newId, readSeedStore, writeSeedStore } from '@/lib/store';

type OrdersStore = {
  meta?: Record<string, unknown>;
  headers?: string[];
  orders: LiveOrderRow[];
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = readSeedStore<OrdersStore>('orders.json', { orders: [] });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const data = readSeedStore<OrdersStore>('orders.json', { orders: [] });
  const orderId = newId('ord').replace('ord-', '');
  const po = String(body.poNumber || `D2R-LOCAL-${Date.now().toString().slice(-5)}`);
  const total = Number(body.total || 0);
  const row: LiveOrderRow = {
    'PO Number': po,
    Store: String(body.store || body.brand || 'ALP'),
    Account: String(body.account || '—'),
    Customer: String(body.customer || '—'),
    Location: String(body.location || '—'),
    Fulfillment: String(body.fulfillment || body.status || 'Draft'),
    ETA: '-',
    Total: `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'Sales Rep': String(body.rep || user.name),
    Created: new Date().toLocaleDateString('en-US'),
    _links: [{ t: po, h: `/orders/${orderId}` }],
  };
  data.headers = data.headers?.length ? data.headers : [...LIVE_ORDER_HEADERS];
  data.orders = [row, ...(data.orders || [])];
  writeSeedStore('orders.json', data);
  return NextResponse.json({ ok: true, order: row });
}
