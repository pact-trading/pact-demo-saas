import { Pricing, type PlanCard } from '@/components/pricing';
import { pact } from '@/lib/pact';

export const dynamic = 'force-dynamic';

const every = (seconds: number) =>
  seconds % 2_592_000 === 0 ? (seconds === 2_592_000 ? 'month' : `${seconds / 2_592_000} months`)
  : seconds % 604_800 === 0 ? (seconds === 604_800 ? 'week' : `${seconds / 604_800} weeks`)
  : seconds % 86_400 === 0 ? (seconds === 86_400 ? 'day' : `${seconds / 86_400} days`)
  : `${Math.round(seconds / 60)} min`;

/** Plans come from Pact (server side, secret key); the browser only gets what the card shows. */
export default async function PricingPage() {
  const only = (process.env.PACT_PLAN_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const { data } = await pact.subscriptions.listPlans();
  const plans: PlanCard[] = data
    .filter(p => (p as { status?: string }).status !== 'archived' && (!only.length || only.includes(p.id)))
    .map(p => ({ id: p.id, name: p.name, price: Number(p.amount).toFixed(2), interval: every(p.periodSeconds), description: (p as { description?: string }).description ?? '' }));
  return (
    <>
      <section className="hero">
        <h1>Write together. Bill in USDT.</h1>
        <p className="lead">Shared drafts, comments and version history for small teams. Subscribe with your email: no wallet, no gas, cancel anytime.</p>
      </section>
      <div className="features">
        {['Unlimited drafts', 'Team comments', 'Version history', 'Export to PDF'].map(f => <div key={f} className="card">✦ {f}</div>)}
      </div>
      {plans.length ? <Pricing plans={plans} /> : <div className="card">No plans yet: create one in the Pact dashboard.</div>}
    </>
  );
}
