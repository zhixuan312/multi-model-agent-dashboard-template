'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Inbox, SearchX } from 'lucide-react';
import { Badge, Button, DataTable, EmptyState, SearchInput, Toolbar } from '@/components/ui';
import { formatCount, formatDuration } from '@/lib/format';
import { formatDateTime } from '@/lib/format-date';
import type { DemoRecord } from '@/data/demo';

const STATUS_VARIANT: Record<DemoRecord['status'], 'sage' | 'amber' | 'rose'> = {
  ok: 'sage',
  degraded: 'amber',
  failed: 'rose',
};

/**
 * The data-table demo — a filterable, sortable, full-height grid.
 *
 * `fill` is the mode to copy for a records page: the table shows every row and
 * scrolls internally under a sticky header, instead of paginating. It only
 * works when the page gives it a height bound, which is what
 * `DashboardPage scroll="inner"` does.
 */
export function RecordsTable({ rows }: { rows: DemoRecord[] }) {
  const [query, setQuery] = useState('');

  const columns = useMemo<ColumnDef<DemoRecord>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 110,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
      },
      { accessorKey: 'endpoint', header: 'Endpoint' },
      { accessorKey: 'region', header: 'Region', size: 150 },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]} dot size="sm">
            {row.original.status}
          </Badge>
        ),
      },
      // Numerics are right-aligned and tabular, header included. Ragged-right
      // numbers cannot be compared down a column, which is the only reason to
      // put them in a column; and a right-aligned cell under a left-aligned
      // header reads as a mistake, so the header goes with it.
      {
        accessorKey: 'durationMs',
        header: () => <span className="block text-right">Duration</span>,
        size: 110,
        cell: ({ row }) => (
          <span className="block text-right tabular-nums">
            {formatDuration(row.original.durationMs)}
          </span>
        ),
      },
      {
        accessorKey: 'costUsd',
        header: () => <span className="block text-right">Cost</span>,
        size: 100,
        // Fixed precision for the whole column. `formatCost` switches to four
        // decimals below a cent, which is right for a single figure and wrong
        // for a column: $0.03 above $0.0044 breaks the decimal alignment that
        // is the only reason to right-align in the first place.
        cell: ({ row }) => (
          <span className="block text-right tabular-nums">
            ${row.original.costUsd.toFixed(4)}
          </span>
        ),
      },
      {
        accessorKey: 'at',
        header: 'When',
        size: 190,
        cell: ({ row }) => (
          <span className="text-ink-soft">{formatDateTime(row.original.at)}</span>
        ),
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.id, r.endpoint, r.region, r.status].some((v) => v.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Toolbar>
        <SearchInput label="records" value={query} onChange={setQuery} />
      </Toolbar>
      <DataTable
        columns={columns}
        data={filtered}
        fill
        data-testid="records-table"
        // Two different empty states, branched on the UNFILTERED length. A
        // filter miss told "no records yet" sends the reader looking for a
        // data problem that does not exist; the fix is a keystroke away and
        // the screen has to say so.
        emptyState={
          rows.length === 0 ? (
            <EmptyState
              icon={<Inbox />}
              title="No records yet"
              description="Requests appear here as soon as the service handles them."
            />
          ) : (
            <EmptyState
              icon={<SearchX />}
              title="No records match"
              description={`Nothing matches “${query.trim()}”. Clear the filter to see all ${formatCount(rows.length)} records.`}
              action={
                <Button variant="secondary" onClick={() => setQuery('')}>
                  Clear filter
                </Button>
              }
            />
          )
        }
      />
    </div>
  );
}
