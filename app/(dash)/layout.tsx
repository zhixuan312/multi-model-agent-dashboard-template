import type { ReactNode } from 'react';
import { AppShell } from '@/components/ui';
import { Sidebar, SidebarStat } from '@/components/Sidebar';
import { Eyebrow, ThemeToggle } from '@/components/ui';
import { formatCount } from '@/lib/format';
import { demoTotals } from '@/data/demo';

/**
 * The locked dashboard frame. Only `ShellBody` — reached through the page's own
 * `PageFrame` — ever scrolls.
 *
 * No `topRight`: that slot is for GLOBAL utilities that belong to the shell (a
 * notification bell, an account menu). Per-page state such as the period picker
 * lives in each page's `PageFrame` actions instead. If you do add a `topRight`
 * cluster, re-read the note in `ui/shell.tsx` about reserving the right gutter.
 *
 * This is also where an auth gate belongs: read the session here and `redirect`
 * before rendering the shell, so no route under `(dash)` can render unauthed.
 */
export default async function DashLayout({ children }: { children: ReactNode }) {
  const totals = demoTotals('30d');

  return (
    <AppShell
      sidebar={
        <Sidebar
          footer={
            <>
              <Eyebrow className="px-2.5 !text-[0.625rem] text-ink-faint">Last 30 days</Eyebrow>
              <dl className="flex flex-col gap-1.5 px-2.5">
                <SidebarStat label="Requests" value={formatCount(totals.requests)} />
                <SidebarStat label="p95 latency" value={`${totals.p95Ms} ms`} />
                <SidebarStat label="Failing checks" value="1 check" tone="attention" />
              </dl>
              <div className="px-2.5 pt-1">
                <ThemeToggle />
              </div>
            </>
          }
        />
      }
    >
      {/* `display: contents` so the page's PageFrame becomes a direct flex child
          of the shell column — that is what keeps ShellBody the only scroller. */}
      <div data-testid="main-column" className="contents">
        {children}
      </div>
    </AppShell>
  );
}
