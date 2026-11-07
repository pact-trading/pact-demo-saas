'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Pact's subscribe page in a panel over our pricing page, so the customer never leaves Draftboard.
 * The page is opened with ?embed=1&frame=1: it reports `subscription.active` back to this window
 * (only to our origin), and opens a small Pact window for the one wallet signature.
 * @pactagent/checkout-react 0.2.0 ships this as <Subscribe mode="embedded">; until it is on npm,
 * Draftboard keeps this small copy.
 */
export function EmbeddedSubscribe({ planId, label, className, checkoutOrigin = 'https://pay.pactagent.app', onSuccess }: {
  planId: string;
  label: string;
  className?: string;
  checkoutOrigin?: string;
  onSuccess: (result: { subscriptionId: string; planId: string }) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const callback = useRef(onSuccess);
  callback.current = onSuccess;
  const origin = new URL(checkoutOrigin).origin;

  useEffect(() => {
    if (!url) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== frame.current?.contentWindow) return;
      const data = event.data as { source?: string; type?: string; subscriptionId?: string; planId?: string };
      if (data?.source !== 'pact' || data.type !== 'subscription.active' || typeof data.subscriptionId !== 'string') return;
      setDone(true);
      callback.current({ subscriptionId: data.subscriptionId, planId: data.planId ?? planId });
      window.setTimeout(() => setUrl(null), 1500);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setUrl(null); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('message', onMessage);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [url, origin, planId]);

  const open = () => setUrl(`${origin}/subscribe/${encodeURIComponent(planId)}?${new URLSearchParams({ embed: '1', frame: '1', origin: window.location.origin })}`);

  return (
    <>
      <button type="button" className={className} onClick={open} disabled={done}>
        {done ? 'Subscribed' : label}
      </button>
      {url && (
        <div role="dialog" aria-modal="true" aria-label="Subscribe" onClick={event => { if (event.target === event.currentTarget) setUrl(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="relative h-[min(760px,100%)] w-[min(1040px,100%)] overflow-hidden rounded-2xl bg-slate-950 shadow-2xl">
            <button type="button" aria-label="Close" onClick={() => setUrl(null)}
              className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25">
              <X size={18} />
            </button>
            <iframe ref={frame} src={url} title="Subscribe with Pact" className="size-full border-0"
              allow="publickey-credentials-get *; publickey-credentials-create *; clipboard-write" />
          </div>
        </div>
      )}
    </>
  );
}
