import { NextResponse } from 'next/server';
import { getTransfers } from '@/lib/data';

export async function GET() {
  return NextResponse.json({ transfers: getTransfers() });
}
