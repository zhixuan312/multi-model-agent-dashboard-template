import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * One hairline label/value row — the unit a facts panel is built from.
 *
 * Values are `tabular-nums` so a stack of them aligns
 * on the decimal without a table.
 */
export function Stat({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 border-b border-line py-1.5 last:border-0',
        className,
      )}
    >
      <span className="shrink-0 text-xs text-ink-faint">{label}</span>
      <span className="min-w-0 truncate text-right text-sm tabular-nums text-ink">{value}</span>
    </div>
  );
}
