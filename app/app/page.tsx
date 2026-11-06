'use client';

import { FileDown, FileText, History, Lock } from 'lucide-react';

import Link from 'next/link';
import { useSession } from '@/components/app-shell';

const DRAFTS = [
  { title: 'Launch plan', who: 'Maya, Leo', when: '2 min ago', words: 1240, pro: false },
  { title: 'Q4 newsletter', who: 'You', when: '1 hour ago', words: 860, pro: false },
  { title: 'Pricing page copy', who: 'Leo', when: 'Yesterday', words: 530, pro: false },
  { title: 'Onboarding emails (5)', who: 'Maya', when: '2 days ago', words: 2210, pro: true },
  { title: 'Press release draft', who: 'You, Maya', when: 'Last week', words: 940, pro: true },
  { title: 'Investor update, October', who: 'You', when: 'Last week', words: 1670, pro: true },
];

export default function Workspace() {
  const { account, loaded } = useSession();
  const pro = !!account?.access;
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {loaded && account && !account.access && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>{account.status === 'past_due' ? 'Your last renewal failed, so Pro features are paused. Top up your balance and we will retry.' : 'Your subscription has ended. You are on the Free plan.'}</span>
          <Link href="/app/billing" className="font-semibold underline">Billing</Link>
        </div>
      )}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-slate-500">Good evening</p>
          <h1 className="text-2xl font-semibold tracking-tight">Acme Studio</h1>
        </div>
        <button className="btn btn-brand">+ New draft</button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[['Drafts', pro ? '24' : '3 / 3'], ['Words this week', '6,480'], ['Plan', pro ? 'Pro' : 'Free']].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500">{k}</p><p className="mt-1 text-xl font-semibold">{v}</p></div>
        ))}
      </div>

      <h2 id="drafts" className="mt-10 text-sm font-semibold uppercase tracking-wider text-slate-400">Recent drafts</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
        {DRAFTS.map(d => {
          const locked = d.pro && !pro;
          return (
            <div key={d.title} className={`flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0 ${locked ? 'bg-slate-50 text-slate-400' : 'hover:bg-slate-50'}`}>
              <span className="grid size-9 place-items-center rounded-lg bg-slate-100">{locked ? <Lock className="size-4 text-slate-400" /> : <FileText className="size-4 text-slate-500" />}</span>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-medium ${locked ? '' : 'text-slate-900'}`}>{d.title}</p>
                <p className="text-xs text-slate-500">{d.who}, {d.words.toLocaleString()} words</p>
              </div>
              <span className="text-xs text-slate-500">{locked ? <Link href="/#pricing" className="font-semibold text-brand">Pro</Link> : d.when}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {([[History, 'Version history', 'Restore any earlier version of a draft.'], [FileDown, 'Export to PDF', 'Send a polished PDF to your client.']] as const).map(([Icon, title, text]) => (
          <div key={title} className={`rounded-xl border p-5 ${pro ? 'border-slate-200' : 'border-dashed border-slate-300'}`}>
            <p className="flex items-center gap-2 font-semibold"><Icon className="size-4 text-brand" /> {title} {!pro && <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">Pro</span>}</p>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
