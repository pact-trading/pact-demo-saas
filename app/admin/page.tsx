import Link from 'next/link';
import { DraftboardLogo } from '@/components/logo';
import { listAccounts, webhookLog } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';
const badge = { active: 'bg-emerald-50 text-emerald-700', trialing: 'bg-sky-50 text-sky-700', past_due: 'bg-amber-50 text-amber-800', cancelled: 'bg-slate-100 text-slate-600' } as const;

/** The operator view: subscribers and the webhooks that told this app about them. */
export default function Admin() {
  const accounts = listAccounts(), log = webhookLog();
  const mrr = accounts.filter(a => a.access).reduce((t, a) => t + Number(a.charges[0]?.amount ?? 0), 0);
  const collected = accounts.reduce((t, a) => t + a.charges.reduce((s, c) => s + Number(c.amount), 0), 0);
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-3"><DraftboardLogo /><span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">Admin</span></div>
          <Link href="/app" className="text-sm text-slate-600 hover:text-slate-900">Open app →</Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Subscribers</h1>
        <p className="text-sm text-slate-500">Access is granted, kept and removed only by verified Pact webhooks.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[['Active subscribers', String(accounts.filter(a => a.access).length)], ['Recurring (per period)', `$${mrr.toFixed(2)}`], ['Collected (USDT)', `$${collected.toFixed(2)}`], ['Webhooks received', String(log.length)]].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">{k}</p><p className="mt-1 text-2xl font-semibold">{v}</p></div>
          ))}
        </div>
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr>{['Customer', 'Subscription', 'Status', 'Payments', 'Next charge'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map(a => (
                <tr key={a.subscriptionId}>
                  <td className="px-4 py-3 font-medium">{a.customer ?? '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.subscriptionId}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge[a.status]}`}>{a.status.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3">{a.charges.length} · ${a.charges.reduce((t, c) => t + Number(c.amount), 0).toFixed(2)}</td>
                  <td className="px-4 py-3">{a.nextChargeAt && a.access ? new Date(a.nextChargeAt).toLocaleTimeString() : '-'}</td>
                </tr>
              ))}
              {!accounts.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No subscribers yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <h2 className="mt-10 text-lg font-semibold">Webhooks from Pact</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr>{['Received', 'Type', 'Event', 'Attempt', 'Result'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {log.map(w => (
                <tr key={`${w.id}-${w.receivedAt}`}>
                  <td className="px-4 py-3">{new Date(w.receivedAt).toLocaleTimeString()}</td>
                  <td className="px-4 py-3"><code className="rounded bg-slate-100 px-2 py-0.5 text-xs">{w.type}</code></td>
                  <td className="px-4 py-3 font-mono text-xs">{w.id}</td>
                  <td className="px-4 py-3">{w.attempt ?? 1}</td>
                  <td className="px-4 py-3">{w.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
