'use client';

import { CreditCard, FileText, House, LayoutTemplate, Users, Wrench } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DraftboardMark } from './logo';

export interface Account {
  subscriptionId: string; planId: string | null; planName?: string; customer: string | null;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled'; access: boolean; nextChargeAt: string | null; createdAt: string;
  charges: Array<{ amount: string; txHash: string | null; at: string }>;
}
interface Session { subscriptionId: string | null; account: Account | null; loaded: boolean }
const SessionContext = createContext<Session>({ subscriptionId: null, account: null, loaded: false });
export const useSession = () => useContext(SessionContext);

/** The signed-in app. Access is whatever the latest Pact webhook said, polled from our own API. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session>({ subscriptionId: null, account: null, loaded: false });
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('subscription');
    let saved: string | null = null;
    try {
      if (fromUrl) localStorage.setItem('draftboard-subscription', fromUrl);
      saved = localStorage.getItem('draftboard-subscription');
    } catch { /* private mode */ }
    const id = fromUrl ?? saved;
    if (!id) return setSession({ subscriptionId: null, account: null, loaded: true });
    let stop = false;
    const tick = async () => {
      const response = await fetch(`/api/subscriptions/${id}`, { cache: 'no-store' });
      setSession({ subscriptionId: id, account: response.ok ? await response.json() : null, loaded: true });
      if (!stop) setTimeout(tick, 2000);
    };
    void tick();
    return () => { stop = true; };
  }, []);
  const plan = session.account?.access ? session.account.planName ?? 'Pro' : 'Free';
  const nav = [
    { href: '/app', label: 'Home', icon: House },
    { href: '/app#drafts', label: 'Drafts', icon: FileText },
    { href: '/app#shared', label: 'Shared with me', icon: Users },
    { href: '/app#templates', label: 'Templates', icon: LayoutTemplate },
  ];
  return (
    <SessionContext.Provider value={session}>
      <div className="flex min-h-screen bg-white">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50/70 p-4 md:flex">
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1"><DraftboardMark className="size-7" /><span className="font-semibold">Draftboard</span></Link>
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-amber-500 text-sm font-bold text-white">A</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Acme Studio</p>
              <p className="truncate text-xs text-slate-500">{session.account?.customer ?? 'Personal workspace'}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${plan !== 'Free' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>{plan}</span>
          </div>
          <nav className="mt-6 space-y-1 text-sm">
            {nav.map(n => (
              <Link key={n.href} href={n.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${pathname === n.href ? 'bg-white font-medium shadow-sm' : 'text-slate-600 hover:bg-white'}`}><n.icon className="size-4 text-slate-500" />{n.label}</Link>
            ))}
          </nav>
          <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Settings</p>
          <nav className="mt-2 space-y-1 text-sm">
            <Link href="/app/billing" className={`flex items-center gap-3 rounded-lg px-3 py-2 ${pathname === '/app/billing' ? 'bg-white font-medium shadow-sm' : 'text-slate-600 hover:bg-white'}`}><CreditCard className="size-4 text-slate-500" />Plan &amp; billing</Link>
            <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-white"><Wrench className="size-4 text-slate-500" />Admin (operator)</Link>
          </nav>
          {!session.account?.access && (
            <div className="mt-auto rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-sm font-semibold">Upgrade to Pro</p>
              <p className="mt-1 text-xs text-slate-400">Unlimited drafts, version history and exports.</p>
              <Link href="/#pricing" className="btn btn-brand mt-3 w-full py-2 text-sm">See plans</Link>
            </div>
          )}
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </SessionContext.Provider>
  );
}
