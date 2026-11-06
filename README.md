# Draftboard: a SaaS billed by subscription in USDT through Pact

A Next.js app (frontend and backend) for a team writing tool: marketing site, pricing table, the
signed-in workspace and a Plan & billing page. It sells monthly plans and renews them in USDT on
Whitechain Sepolia through [Pact](https://pay.pactagent.app). It is a separate app that only uses
Pact's SDK and API, the way a real software business would.

**Flow:** pricing page with Pact's embedded `<Subscribe>` button → Pact's subscribe window opens over
the app → the customer signs in with email and signs one capped, cancellable mandate (no wallet, no
gas) → the window closes and the app shows the account → Pact's **signed webhooks** grant access
(`subscription.created`), keep it on every renewal (`subscription.renewed`, pulled by Pact's keeper,
the customer never signs again) and remove it when a renewal fails or the customer cancels.

```
Pricing page ── <Subscribe planId> ──popup──▶ Pact /subscribe (email sign-in, sign mandate)
     ▲                                             │ postMessage { subscriptionId } to this origin only
     └──────────── /account?subscription=… ◀───────┘
Pact keeper ── SubscriptionManagerV2.charge every period ──▶ webhooks ──▶ /api/webhooks/pact
```

## The integration (about 25 lines)

`components/pricing.tsx`, the embedded part:

```tsx
<Subscribe
  layout="button"            // our own pricing card, Pact's button
  planId={plan.id}
  checkoutOrigin={process.env.NEXT_PUBLIC_PACT_CHECKOUT_ORIGIN}
  plan={{ name: plan.name, price: `$${plan.price}`, interval: plan.interval }}
  onSuccess={({ subscriptionId }) => router.push(`/account?subscription=${subscriptionId}`)}
/>
```

`app/api/webhooks/pact/route.ts`, where access is decided:

```ts
export const POST = Webhooks({
  secret: process.env.PACT_WEBHOOK_SECRET!,
  onSubscriptionCreated: async event => grant(event.object_id, event.customer, event.plan_id),
  onSubscriptionRenewed: async event => recordCharge(event.object_id, event.amountChargedMinor, event.tx_hash),
  onSubscriptionPastDue: async event => pause(event.object_id),
  onSubscriptionCancelled: async event => revoke(event.object_id),
});
```

Plans are read on the server with the secret key: `pact.subscriptions.listPlans()`.

## Run it

1. In the Pact dashboard: create plans under **Billing → Plans** (on the testnet, "Every 2 minutes"
   shows renewals quickly), a secret key under **Developers → API keys**, and under **Developers →
   Webhooks** set the URL to `http://localhost:3230/api/webhooks/pact`. Sign Pact's fee terms once.
2. `cp .env.example .env.local` and fill it in (`PACT_PLAN_IDS` is optional).
3. `pnpm install && pnpm build && pnpm start` → http://localhost:3230

Pages: `/` marketing and pricing, `/app` workspace (Pro features lock and unlock with the subscription),
`/app/billing` (plan, payment method, billing history with transaction links), `/admin` (subscribers and webhooks).

## Notes

- The popup only reports back to the origin that opened it, and the app still grants access only from
  the signed webhook.
- Accounts are kept in `data/app.json` for the demo.
