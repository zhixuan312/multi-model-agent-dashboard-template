'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { PERIODS, PERIOD_LABEL, parsePeriod } from '@/lib/period';

/**
 * The period picker. Writes `?period=` and lets the server component re-render.
 *
 * The URL is the state — not a React context — so a period-scoped view is
 * linkable, refreshable, and readable by a server component without any client
 * round-trip.
 */
export function PeriodSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const period = parsePeriod(params.get('period'));

  function onChange(next: string) {
    const q = new URLSearchParams(params.toString());
    q.set('period', next);
    router.push(`${pathname}?${q.toString()}`);
  }

  return (
    <Select value={period} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]" aria-label="Reporting period">
        {/* Explicit children, not a bare <SelectValue />. Radix resolves the
            selected item's label from its rendered items, and the items live in
            a portal that has not mounted on first paint — so the trigger comes
            up blank until the menu is opened once. */}
        <SelectValue>{PERIOD_LABEL[period]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PERIODS.map((p) => (
          <SelectItem key={p} value={p}>
            {PERIOD_LABEL[p]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
