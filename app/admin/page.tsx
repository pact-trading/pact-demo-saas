import { listAccounts, webhookLog } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

/** Subscribers and the webhooks that told this app about them. */
export default function Admin() {
  const accounts = listAccounts(), log = webhookLog();
  return (
    <>
      <h1>Subscribers</h1>
      <p className="lead">Access is granted, kept and removed only by verified Pact webhooks.</p>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Customer</th><th>Subscription</th><th>Status</th><th>Access</th><th>Charges</th><th>Next charge</th></tr></thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.subscriptionId}>
                <td>{a.customer ?? '-'}</td>
                <td className="mono"><a href={`/account?subscription=${a.subscriptionId}`}>{a.subscriptionId}</a></td>
                <td><span className={`status ${a.status}`}>{a.status.replace('_', ' ')}</span></td>
                <td>{a.access ? 'Pro' : 'none'}</td>
                <td>{a.charges.length} (${a.charges.reduce((t, c) => t + Number(c.amount), 0).toFixed(2)})</td>
                <td>{a.nextChargeAt ? new Date(a.nextChargeAt).toLocaleTimeString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h1 style={{ fontSize: 22 }}>Webhooks received</h1>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Received</th><th>Event</th><th>Type</th><th>Attempt</th><th>Result</th></tr></thead>
          <tbody>
            {log.map(w => (
              <tr key={`${w.id}-${w.receivedAt}`}>
                <td>{new Date(w.receivedAt).toLocaleTimeString()}</td>
                <td className="mono">{w.id}</td>
                <td>{w.type}</td>
                <td>{w.attempt ?? 1}</td>
                <td>{w.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
