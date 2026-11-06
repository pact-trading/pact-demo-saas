import { NextResponse } from 'next/server';
import { getAccount } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

/** The account page polls this until Pact's subscription webhook has arrived. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const account = getAccount((await params).id);
  return account ? NextResponse.json(account) : NextResponse.json({ error: 'not_yet' }, { status: 404 });
}
