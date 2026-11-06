import 'server-only';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** What this app knows about each subscriber: every field learned from Pact's signed webhooks. */
export interface Charge { amount: string; txHash: string | null; at: string }
export interface Account {
  subscriptionId: string;
  planId: string | null;
  customer: string | null;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  access: boolean;
  nextChargeAt: string | null;
  createdAt: string;
  charges: Charge[];
}
export interface WebhookLogEntry { id: string; type: string; objectId: string; result: string; receivedAt: string; attempt?: number }
interface Book { accounts: Account[]; webhooks: WebhookLogEntry[] }

const dir = join(process.cwd(), 'data'), file = join(dir, 'app.json');
const read = (): Book => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { accounts: [], webhooks: [] });
const write = (book: Book) => { mkdirSync(dir, { recursive: true }); writeFileSync(file, JSON.stringify(book, null, 2)); };

export const listAccounts = () => read().accounts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const getAccount = (subscriptionId: string) => read().accounts.find(a => a.subscriptionId === subscriptionId) ?? null;
export const webhookLog = () => read().webhooks.slice(0, 50);
export const seenEvent = (eventId: string) => read().webhooks.some(w => w.id === eventId && w.result !== 'error');

export function upsertAccount(subscriptionId: string, change: (account: Account) => void) {
  const book = read();
  let account = book.accounts.find(a => a.subscriptionId === subscriptionId);
  if (!account) {
    account = { subscriptionId, planId: null, customer: null, status: 'active', access: false, nextChargeAt: null, createdAt: new Date().toISOString(), charges: [] };
    book.accounts.push(account);
  }
  change(account);
  write(book);
  return account;
}

export function logWebhook(entry: WebhookLogEntry) {
  const book = read();
  book.webhooks.unshift(entry);
  write(book);
}
