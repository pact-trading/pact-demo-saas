/** Draftboard mark: two stacked pages with a writing stroke. */
export function DraftboardMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="db-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#db-g)" />
      <rect x="13" y="9" width="17" height="21" rx="3" fill="#fff" opacity=".35" />
      <rect x="9" y="12" width="17" height="21" rx="3" fill="#fff" />
      <path d="M12.5 19h9M12.5 23h6" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.5 27.5c1.5-1.6 3-1.6 4.4 0s2.9 1.6 4.4 0" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    </svg>
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
