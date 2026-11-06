import { ArrowRight, FileText, History, MessageSquare, PenLine, Share, ShieldCheck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { DraftboardLogo } from '@/components/logo';
import { Pricing, type PlanCard } from '@/components/pricing';
import { pact } from '@/lib/pact';

export const dynamic = 'force-dynamic';

const every = (seconds: number) => (seconds < 3600 ? `${Math.round(seconds / 60)} minutes` : seconds < 86_400 ? `${Math.round(seconds / 3600)} hours` : `${Math.round(seconds / 86_400)} days`);

/** Plans come from Pact (server side, secret key); the browser only gets what the cards show. */
export default async function Landing() {
  const only = (process.env.PACT_PLAN_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const { data } = await pact.subscriptions.listPlans();
  const plans: PlanCard[] = data
    .filter(p => (p as { status?: string }).status !== 'archived' && (!only.length || only.includes(p.id)))
    .sort((a, b) => Number(a.amount) - Number(b.amount))
    .map(p => ({ id: p.id, name: p.name, price: String(Number(p.amount)), description: (p as { description?: string }).description ?? '', demoPeriod: every(p.periodSeconds) }));
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/"><DraftboardLogo /></Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">Product</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <a href="#customers" className="hover:text-slate-900">Customers</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/app" className="btn px-3 text-slate-700 hover:bg-slate-50">Sign in</Link>
            <a href="#pricing" className="btn btn-dark">Get started</a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-20 text-center">
          <a href="#pricing" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <span className="rounded-full bg-brand px-2 py-0.5 text-white">New</span> Pay for Draftboard in USDT, no wallet needed <ArrowRight className="inline size-3.5 align-[-2px]" />
          </a>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">Write together. <span className="text-brand">Ship faster.</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">Draftboard is the shared writing space for small teams: drafts, comments, suggestions and every version, in one calm place.</p>
          <div className="mt-8 flex justify-center gap-3">
            <a href="#pricing" className="btn btn-brand px-5 py-3">Start free trial</a>
            <Link href="/app" className="btn btn-outline px-5 py-3">Open the app</Link>
          </div>
        </div>
        <AppPreview />
      </section>

      <section id="customers" className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <p className="text-center text-sm text-slate-500">Trusted by 4,000+ writers and teams</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-lg font-semibold text-slate-400">
            {['Northwind', 'Lumen Labs', 'Harbor & Co', 'Fieldnote', 'Quillwork', 'Paperplane'].map(n => <span key={n}>{n}</span>)}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Everything a team needs to go from first draft to published.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [<PenLine key="a" className="size-5 text-brand" strokeWidth={1.8} />, 'Write in real time', 'Everyone edits the same draft, with live cursors and no merge conflicts.'],
            [<MessageSquare key="b" className="size-5 text-brand" strokeWidth={1.8} />, 'Comments & suggestions', 'Suggest a change, discuss it inline, accept it with one click.'],
            [<History key="c" className="size-5 text-brand" strokeWidth={1.8} />, 'Every version, forever', 'Scroll back through every save. Restore any paragraph.'],
            [<Share key="d" className="size-5 text-brand" strokeWidth={1.8} />, 'Export anywhere', 'PDF, Markdown, Google Docs or your CMS, formatting intact.'],
            [<ShieldCheck key="e" className="size-5 text-brand" strokeWidth={1.8} />, 'Roles & approvals', 'Decide who can edit, comment or publish each document.'],
            [<Wallet key="f" className="size-5 text-brand" strokeWidth={1.8} />, 'Pay in USDT', 'Subscribe with your email through Pact. Renewals run automatically within the cap you approve.'],
          ].map(([icon, title, text]) => (
            <div key={String(title)} className="rounded-2xl border border-slate-200 p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-50">{icon}</span>
              <p className="mt-4 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-slate-50/70 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight">Simple pricing</h2>
            <p className="mt-3 text-slate-600">Pay monthly in USDT. No wallet, no gas, cancel in one click.</p>
          </div>
          <div className="mt-12">{plans.length ? <Pricing plans={plans} /> : <p className="text-center text-slate-500">No plans yet.</p>}</div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
        <h2 className="text-3xl font-semibold tracking-tight">Questions</h2>
        <dl className="mt-8 divide-y divide-slate-200">
          {[
            ['Do I need a crypto wallet?', 'No. You sign in with your email; Pact creates a secure account for you. You never hold gas or a seed phrase.'],
            ['How do renewals work?', 'You approve a cap once: the plan price, once per period, for at most a set number of periods. Pact charges within it automatically and emails you before and after each charge.'],
            ['Can I cancel?', 'Anytime, from your billing page, with one confirmation. Nothing more is charged.'],
            ['What happens if a renewal fails?', 'We email you, pause Pro features and retry. Top up your balance and access comes back on the next attempt.'],
          ].map(([q, a]) => (
            <div key={q} className="py-5"><dt className="font-semibold">{q}</dt><dd className="mt-2 text-slate-600">{a}</dd></div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500">
          <DraftboardLogo />
          <p>© 2026 Draftboard, Inc. Billing by Pact on Whitechain. Testnet demo.</p>
          <Link href="/admin" className="hover:text-slate-900">Admin</Link>
        </div>
      </footer>
    </>
  );
}

/** A static picture of the app, built in HTML so it stays sharp. */
function AppPreview() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-20">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <span className="rounded-md bg-white px-3 py-1 text-xs text-slate-400">app.draftboard.io/launch-plan</span>
        </div>
        <div className="grid grid-cols-[200px_1fr] text-left">
          <aside className="border-r border-slate-100 bg-slate-50/60 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Drafts</p>
            {['Launch plan', 'Q4 newsletter', 'Pricing page copy', 'Onboarding emails', 'Press release'].map((d, i) => (
              <p key={d} className={`mt-2 rounded-md px-2 py-1.5 ${i === 0 ? 'bg-white font-medium shadow-sm' : 'text-slate-600'}`}><FileText className="mr-2 inline size-3.5 align-[-2px] text-slate-400" />{d}</p>
            ))}
          </aside>
          <div className="p-8">
            <p className="text-xs text-slate-400">Edited 2 min ago by Maya and Leo</p>
            <p className="mt-2 text-2xl font-semibold">Launch plan</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">We announce on <span className="rounded bg-indigo-100 px-1">Tuesday at 9 AM</span> with a short post, a demo video and an email to the waitlist. <span className="border-b-2 border-violet-400">Leo</span> owns the video; Maya writes the post.</p>
            <div className="mt-5 max-w-sm rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
              <p className="font-semibold">Maya commented</p>
              <p className="mt-1 text-slate-600">Can we move this to Wednesday? The video needs one more pass.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
