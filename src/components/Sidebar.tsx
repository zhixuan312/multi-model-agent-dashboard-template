'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Eyebrow } from '@/components/ui';
import { AppMark } from '@/components/AppMark';
import { NAV_SECTIONS, type NavItem } from '@/nav';

/**
 * The primary rail. Route knowledge lives in `@/nav`, not here — this component
 * only renders sections and marks the active one.
 *
 * `footer` is the rail's own status block. Without something down there the
 * lower two thirds of the rail is empty pale surface, which reads as a panel
 * that stops short rather than a full-height rail. Use `SidebarStat` for the
 * usual two-column label/value lines.
 */
export function Sidebar({ footer }: { footer?: ReactNode }) {
  const pathname = usePathname();

  function renderLink(item: NavItem) {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative flex items-center gap-2.5 rounded-[var(--r)] px-2.5 py-2 text-sm',
          'transition-colors duration-150 ease-[var(--ease-out)]',
          active
            ? 'bg-accent-tint font-semibold text-accent-deep [&_svg]:text-accent'
            : 'text-ink-soft hover:bg-bg-sunk hover:text-ink [&_svg]:text-ink-faint',
        )}
      >
        {active ? (
          <span
            aria-hidden
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent"
          />
        ) : null}
        <Icon className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <aside
      data-testid="sidebar"
      className="flex min-h-full w-[var(--rail-w)] flex-col border-r border-line bg-surface-2 px-3 py-4"
    >
      <div className="flex items-center gap-2 px-2 pb-4 pt-1">
        <AppMark withWordmark />
      </div>

      <nav aria-label="Primary" className="flex flex-col gap-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className="flex flex-col gap-0.5">
            {section.label ? (
              <Eyebrow className="px-2.5 pb-1 !text-[0.6875rem] text-ink-faint">
                {section.label}
              </Eyebrow>
            ) : null}
            {section.items.map(renderLink)}
          </div>
        ))}
      </nav>

      {footer ? (
        <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">{footer}</div>
      ) : null}
    </aside>
  );
}

/** A label/value line for the sidebar footer. `attention` tints the value amber. */
export function SidebarStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'attention';
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[0.6875rem] text-ink-faint">{label}</dt>
      <dd
        className={cn(
          'truncate text-[0.6875rem] tabular-nums',
          tone === 'attention' ? 'font-medium text-[var(--amber-deep)]' : 'text-ink-soft',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
