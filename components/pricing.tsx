'use client';

import { Check } from 'lucide-react';

import { EmbeddedSubscribe } from './embedded-subscribe';
import { useRouter } from 'next/navigation';

export interface PlanCard { id: string; name: string; price: string; description: string; demoPeriod: string }

const FEATURES: Record<string, string[]> = {
  Free: ['3 drafts', 'Comments', '7-day version history'],
  Pro: ['Unlimited drafts', 'Comments and suggestions', 'Full version history', 'Export to PDF and Markdown'],
  Team: ['Everything in Pro', 'Up to 10 editors', 'Shared workspaces', 'Roles and approvals', 'Priority support'],
};

/** Our own pricing table; the payment part is Pact's embedded <Subscribe> button. */
export function Pricing({ plans }: { plans: PlanCard[] }) {
  const router = useRouter();
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-7">
        <p className="font-semibold">Free</p>
        <p className="mt-4 text-4xl font-semibold tracking-tight">$0</p>
        <p className="mt-1 text-sm text-slate-500">For trying Draftboard alone.</p>
        <a href="/app" className="btn btn-outline mt-6 w-full">Start writing</a>
        <Features items={FEATURES.Free} />
      </div>
      {plans.map((plan, i) => {
        const featured = i === 0;
        return (
          <div key={plan.id} className={`relative rounded-2xl p-7 ${featured ? 'bg-slate-900 text-white shadow-2xl ring-1 ring-slate-900' : 'border border-slate-200 bg-white'}`}>
            {featured && <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
            <p className="font-semibold">{plan.name}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight">${plan.price}<span className={`text-base font-normal ${featured ? 'text-slate-400' : 'text-slate-500'}`}> /month</span></p>
            <p className={`mt-1 text-sm ${featured ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
            <EmbeddedSubscribe
              planId={plan.id}
              checkoutOrigin={process.env.NEXT_PUBLIC_PACT_CHECKOUT_ORIGIN}
              label={`Get ${plan.name}`}
              className={`btn mt-6 w-full ${featured ? 'btn-brand' : 'btn-dark'}`}
              onSuccess={({ subscriptionId }) => {
                try { localStorage.setItem('draftboard-subscription', subscriptionId); } catch { /* private mode */ }
                router.push(`/app/billing?subscription=${subscriptionId}&welcome=1`);
              }}
            />
            <p className={`mt-2 text-center text-xs ${featured ? 'text-slate-400' : 'text-slate-500'}`}>Pay in USDT with your email. Cancel anytime.</p>
            <Features items={FEATURES[plan.name] ?? []} dark={featured} />
            <p className={`mt-6 rounded-lg px-3 py-2 text-xs ${featured ? 'bg-white/10 text-slate-300' : 'bg-amber-50 text-amber-800'}`}>Testnet demo: renews every {plan.demoPeriod} instead of monthly.</p>
          </div>
        );
      })}
    </div>
  );
}

function Features({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="mt-7 space-y-3 text-sm">
      {items.map(f => (
        <li key={f} className="flex gap-3"><Check className={`mt-0.5 size-4 shrink-0 ${dark ? 'text-indigo-300' : 'text-brand'}`} /><span className={dark ? 'text-slate-200' : 'text-slate-700'}>{f}</span></li>
      ))}
    </ul>
  );
}
