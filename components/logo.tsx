'use client';

import { useEffect, useState } from 'react';

/** Draftboard generated mark. */
export function DraftboardMark({ className = 'size-8' }: { className?: string }) {
  const [src, setSrc] = useState('/brand/draftboard.png');
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/brand', { cache: 'no-store' });
        if (!response.ok) return;
        const brand = (await response.json()) as { logoUrl: string | null };
        if (active && brand.logoUrl) {
          setSrc(brand.logoUrl);
          document.querySelector('link[rel="icon"]')?.setAttribute('href', brand.logoUrl);
        }
      } catch { /* Keep the bundled logo while the API is unavailable. */ }
    };
    void load();
    const refresh = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', refresh);
    return () => { active = false; document.removeEventListener('visibilitychange', refresh); };
  }, []);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={32} height={32} className={`${className} rounded-lg object-cover`} referrerPolicy="no-referrer" />
  );
}

export function DraftboardLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <DraftboardMark />
      <span className={`text-[19px] font-semibold tracking-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>Draftboard</span>
    </span>
  );
}
