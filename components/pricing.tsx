'use client';

import { Subscribe } from '@pactagent/checkout-react';
import { useRouter } from 'next/navigation';

export interface PlanCard { id: string; name: string; price: string; interval: string; description: string }

/** The embedded part: Pact's <Subscribe> button, one per plan. */
export function Pricing({ plans }: { plans: PlanCard[] }) {
  const router = useRouter();
  return (
    <div className="plans">
      {plans.map(plan => (
        <Subscribe
          key={plan.id}
          planId={plan.id}
          checkoutOrigin={process.env.NEXT_PUBLIC_PACT_CHECKOUT_ORIGIN}
          plan={{ name: plan.name, price: `$${plan.price}`, interval: plan.interval, description: plan.description }}
          appearance={{ brand: { name: 'Draftboard' } }}
          onSuccess={({ subscriptionId }) => {
            try { localStorage.setItem('draftboard-subscription', subscriptionId); } catch { /* private mode */ }
            router.push(`/account?subscription=${subscriptionId}`);
          }}
        />
      ))}
    </div>
  );
}
