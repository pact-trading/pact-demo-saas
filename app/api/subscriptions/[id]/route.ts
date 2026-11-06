import { NextResponse } from 'next/server';
import { pact } from '@/lib/pact';
import { getAccount } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';
const planNames = new Map<string, string>();

/** The app polls this until Pact's subscription webhook has arrived. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const account = getAccount((await params).id);
  if (!account) return NextResponse.json({ error: 'not_yet' }, { status: 404 });
  if (account.planId && !planNames.has(account.planId))
    planNames.set(account.planId, await pact.subscriptions.getPlan(account.planId).then(p => p.name).catch(() => 'Pro'));
  return NextResponse.json({ ...account, planName: account.planId ? planNames.get(account.planId) : 'Pro' });
}
