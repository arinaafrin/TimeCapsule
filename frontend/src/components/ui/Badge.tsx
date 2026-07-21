type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return <span className={`tc-badge tc-badge-${tone}`}>{children}</span>;
}

/** Maps common status strings across the app to a sensible badge tone. */
export function statusTone(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (['approved', 'verified', 'published', 'completed'].includes(s)) return 'success';
  if (['pending', 'pending_review', 'processing', 'draft'].includes(s)) return 'warning';
  if (['rejected', 'failed', 'suspended'].includes(s)) return 'danger';
  return 'neutral';
}
