'use client';

import { useEffect, useState } from 'react';

interface Account {
  subscriptionId: string; planId: string | null; customer: string | null;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled'; access: boolean; nextChargeAt: string | null;
  charges: Array<{ amount: string; txHash: string | null; at: string }>;
}
const explorer = process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://explorer.testnet.whitechain.io';

/** The app's account page: access is whatever the latest Pact webhook says. */
export default function AccountPage() {
  const [id, setId] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('subscription');
    let saved: string | null = null;
    try { saved = localStorage.getItem('draftboard-subscription'); } catch { /* private mode */ }
    setId(fromUrl ?? saved);
  }, []);
  useEffect(() => {
    if (!id) return;
    let stop = false;
    const tick = async () => {
      const response = await fetch(`/api/subscriptions/${id}`, { cache: 'no-store' });
      if (response.ok) setAccount(await response.json());
      if (!stop) setTimeout(tick, 2000);
    };
    void tick();
    return () => { stop = true; };
  }, [id]);

  if (!id) return <><h1>My account</h1><div className="card">No subscription yet. <a href="/">See plans</a></div></>;
  return (
    <>
      <h1>My account</h1>
      <p className="lead mono">{id}</p>
      {!account ? (
        <div className="banner off">Waiting for Pact to confirm your subscription…</div>
      ) : (
        <div className={`banner ${account.access ? 'on' : 'off'}`}>
          {account.access ? '✓ Pro features unlocked' : account.status === 'past_due' ? 'Renewal failed: access paused until it succeeds' : 'Subscription ended: access removed'}
        </div>
      )}
      <div className="features">
        {['Unlimited drafts', 'Team comments', 'Version history', 'Export to PDF'].map(f => (
          <div key={f} className={`card ${account?.access ? '' : 'locked'}`}>{account?.access ? '✓' : '🔒'} {f}</div>
        ))}
      </div>
      {account && (
        <div className="two">
          <div className="card">
            <strong>Charges</strong>
            <p className="muted" style={{ fontSize: 13 }}>Each one pulled by Pact under the cap you signed. You never sign again.</p>
            <table>
              <thead><tr><th>When</th><th>Amount</th><th>Transaction</th></tr></thead>
              <tbody>
                {account.charges.map(c => (
                  <tr key={`${c.at}-${c.txHash}`}>
                    <td>{new Date(c.at).toLocaleTimeString()}</td>
                    <td>${c.amount}</td>
                    <td className="mono">{c.txHash ? <a href={`${explorer}/tx/${c.txHash}`} target="_blank" rel="noreferrer">{c.txHash.slice(0, 12)}… ↗</a> : '-'}</td>
                  </tr>
                ))}
                {!account.charges.length && <tr><td colSpan={3} className="muted">No charge yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="card">
            <span className={`status ${account.status}`}>{account.status.replace('_', ' ')}</span>
            <p style={{ marginBottom: 0 }}>{account.customer}</p>
            {account.nextChargeAt && account.access && <p className="muted">Next charge {new Date(account.nextChargeAt).toLocaleString()}</p>}
          </div>
        </div>
      )}
    </>
  );
}
