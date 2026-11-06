'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from '@/components/app-shell';

const explorer = process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://explorer.testnet.whitechain.io';
const status = {
  active: ['Active', 'bg-emerald-50 text-emerald-700'],
  trialing: ['Trial', 'bg-sky-50 text-sky-700'],
  past_due: ['Payment failed', 'bg-amber-50 text-amber-800'],
  cancelled: ['Cancelled', 'bg-slate-100 text-slate-600'],
} as const;

/** Plan & billing, like any SaaS settings page. Every line here came from a Pact webhook. */
export default function Billing() {
  const { account, loaded, subscriptionId } = useSession();
  const [welcome, setWelcome] = useState(false);
  useEffect(() => setWelcome(new URLSearchParams(window.location.search).has('welcome')), []);
  const total = account?.charges.reduce((t, c) => t + Number(c.amount), 0) ?? 0;
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Plan &amp; billing</h1>
      <p className="mt-1 text-sm text-slate-500">Billed in USDT on Whitechain through Pact.</p>

      {welcome && account?.access && (
        <div className="mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 p-5 text-white">
          <p className="text-lg font-semibold">🎉 Welcome to Draftboard {account.planName ?? 'Pro'}</p>
          <p className="mt-1 text-sm text-indigo-100">Your subscription is active. Renewals run automatically, and we email you before and after each one.</p>
        </div>
      )}

      {!loaded ? null : !subscriptionId ? (
        <div className="mt-8 rounded-xl border border-slate-200 p-6">
          <p className="font-semibold">You are on the Free plan</p>
          <Link href="/#pricing" className="btn btn-brand mt-4">Upgrade</Link>
        </div>
      ) : !account ? (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-slate-200 p-6 text-slate-600">
          <span className="size-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /> Confirming your subscription with Pact…
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Current plan</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status[account.status][1]}`}>{status[account.status][0]}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold">Draftboard {account.planName ?? 'Pro'}</p>
              <p className="mt-1 text-sm text-slate-600">{account.access ? 'All Pro features are unlocked.' : 'Pro features are paused.'}</p>
              {account.nextChargeAt && account.status === 'active' && (
                <p className="mt-4 text-sm"><span className="text-slate-500">Next charge</span> <span className="font-medium">{new Date(account.nextChargeAt).toLocaleString()}</span></p>
              )}
              <div className="mt-5 flex gap-2">
                <Link href="/#pricing" className="btn btn-outline">Change plan</Link>
                <a href={`${process.env.NEXT_PUBLIC_PACT_CHECKOUT_ORIGIN ?? 'http://localhost:3000'}/portal/subscriptions`} className="btn btn-outline">Cancel or manage</a>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Payment method</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#26A17B] font-bold text-white">₮</span>
                <div>
                  <p className="font-medium">USDT · Pact account</p>
                  <p className="text-xs text-slate-500">{account.customer}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">You approved a capped mandate once. Pact charges within it; no wallet or gas on your side.</p>
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-end justify-between">
              <h2 className="font-semibold">Billing history</h2>
              <p className="text-sm text-slate-500">{account.charges.length} payments · ${total.toFixed(2)} total</p>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Receipt</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {account.charges.map((c, i) => (
                    <tr key={`${c.at}-${c.txHash}`}>
                      <td className="px-4 py-3">{new Date(c.at).toLocaleString()}</td>
                      <td className="px-4 py-3">Draftboard {account.planName ?? 'Pro'} · {i === account.charges.length - 1 ? 'first payment' : 'renewal'}</td>
                      <td className="px-4 py-3 font-medium">${c.amount}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Paid</span></td>
                      <td className="px-4 py-3">{c.txHash ? <a href={`${explorer}/tx/${c.txHash}`} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">View on Whitechain ↗</a> : '-'}</td>
                    </tr>
                  ))}
                  {!account.charges.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">The first payment is confirming…</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
