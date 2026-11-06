import { Webhooks, type PactWebhookEvent } from '@pactagent/node';
import { logWebhook, seenEvent, upsertAccount } from '@/lib/subscriptions';

const usdt = (minor: unknown) => (Number(minor ?? 0) / 1_000_000).toFixed(2);
const log = (event: PactWebhookEvent, result: string) => {
  logWebhook({ id: event.id, type: event.type, objectId: event.object_id, result, receivedAt: new Date().toISOString(), attempt: event.attempt });
  console.log(`[webhook] ${event.type} ${event.id} → ${result}`);
};

/**
 * Pact → this app. Access follows the subscription: granted when it starts, kept on each renewal,
 * removed when a renewal fails or the customer cancels. Signature checked first (401 if not).
 */
export const POST = Webhooks({
  secret: process.env.PACT_WEBHOOK_SECRET!,
  onEvent: async event => {
    if (!event.type.startsWith('subscription.')) log(event, 'received');
  },
  onSubscriptionCreated: async event => {
    if (seenEvent(event.id)) return log(event, 'duplicate');
    upsertAccount(event.object_id, a => {
      a.planId = (event.plan_id as string) ?? a.planId;
      a.customer = (event.customer as string) ?? a.customer;
      a.status = event.status === 'trialing' ? 'trialing' : 'active';
      a.access = true;
      a.nextChargeAt = (event.next_charge_at as string) ?? a.nextChargeAt;
    });
    log(event, `access granted to ${event.customer ?? event.object_id}`);
  },
  onSubscriptionRenewed: async event => {
    if (seenEvent(event.id)) return log(event, 'duplicate');
    upsertAccount(event.object_id, a => {
      a.planId = (event.plan_id as string) ?? a.planId;
      a.customer = (event.customer as string) ?? a.customer;
      a.status = 'active';
      a.access = true;
      a.nextChargeAt = (event.next_charge_at as string) ?? a.nextChargeAt;
      a.charges.unshift({ amount: usdt(event.amountChargedMinor), txHash: event.tx_hash ?? null, at: event.occurred_at });
    });
    log(event, `charged ${usdt(event.amountChargedMinor)} USDT, access kept`);
  },
  onSubscriptionPastDue: async event => {
    upsertAccount(event.object_id, a => { a.status = 'past_due'; a.access = false; });
    log(event, 'renewal failed, access paused');
  },
  onSubscriptionCancelled: async event => {
    upsertAccount(event.object_id, a => { a.status = 'cancelled'; a.access = false; });
    log(event, 'cancelled, access removed');
  },
});
