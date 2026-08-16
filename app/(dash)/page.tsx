import { Activity, Coins, Gauge, Lightbulb, TriangleAlert } from 'lucide-react';
import { DashboardPage } from '@/components/DashboardPage';
import { Panel } from '@/components/Panel';
import { Stat } from '@/components/StatRow';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarList } from '@/components/charts/BarList';
import { CompositionBar } from '@/components/charts/CompositionBar';
import { formatCost, formatCount, formatDuration, formatPercent } from '@/lib/format';
import { parsePeriod } from '@/lib/period';
import { DEMO_ENDPOINTS, DEMO_NOW, DEMO_STALE_AFTER_MS, DEMO_UPDATED_AT, demoTotals, demoTrend } from '@/data/demo';

const NOTE = `- **Spend** — what the period actually cost, day by day
- **Budget** — the flat daily allowance, for comparison
- **Requests** — volume, on its own scale in the lower band

A bar band and a value line never share an axis here: a count and a rate on one
scale flattens whichever is smaller.`;

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const period = parsePeriod((await searchParams).period);
  const totals = demoTotals(period);
  const trend = demoTrend(period);

  const delta = totals.requests - totals.previous.requests;

  return (
    <DashboardPage
      title="Overview"
      updatedAt={DEMO_UPDATED_AT}
      staleAfterMs={DEMO_STALE_AFTER_MS}
      now={DEMO_NOW}
      description="Traffic, latency and spend for the selected period."
      note={NOTE}
      noteIcon={<Lightbulb />}
      noteTitle="How to read this"
      // ONE accent in the row (`emphasis` on Requests — the headline number),
      // one `attention` (Error rate, which is the thing to act on). The other
      // two are ink. A row where every tile is a different colour is a row
      // where nothing is the finding.
      metrics={[
        {
          label: 'Requests',
          value: formatCount(totals.requests),
          icon: <Activity />,
          emphasis: true,
          delta: {
            value: formatPercent(delta / totals.previous.requests, 1),
            direction: delta >= 0 ? 'up' : 'down',
            sentiment: 'good',
          },
          sublabel: 'vs previous period',
        },
        {
          label: 'Error rate',
          value: formatPercent(totals.errorRate, 2),
          icon: <TriangleAlert />,
          tone: 'attention',
          delta: {
            value: formatPercent(totals.previous.errorRate - totals.errorRate, 2),
            direction: 'down',
            sentiment: 'good',
          },
          sublabel: 'of all requests',
        },
        {
          label: 'p95 latency',
          value: formatDuration(totals.p95Ms),
          icon: <Gauge />,
          delta: {
            value: formatDuration(totals.previous.p95Ms - totals.p95Ms),
            direction: 'down',
            sentiment: 'good',
          },
          sublabel: 'milliseconds, 95th percentile',
        },
        {
          label: 'Spend',
          value: formatCost(totals.spendUsd),
          icon: <Coins />,
          delta: {
            value: formatCost(totals.spendUsd - totals.previous.spendUsd),
            direction: totals.spendUsd >= totals.previous.spendUsd ? 'up' : 'down',
            sentiment: 'neutral',
          },
          sublabel: 'US dollars, this period',
        },
      ]}
      rail={
        <Panel title="At a glance">
          <dl>
            <Stat label="Endpoints" value={formatCount(DEMO_ENDPOINTS.length)} />
            <Stat label="Busiest" value={DEMO_ENDPOINTS[0]!.label} />
            <Stat label="Slowest p95" value={formatDuration(2240)} />
            <Stat label="Cost per 1k" value={formatCost(3.1)} />
          </dl>
        </Panel>
      }
    >
      <Panel title="Daily spend and volume">
        <TrendChart
          points={trend}
          series={[
            { key: 'spendUsd', label: 'Spend', shape: 'area', tint: 'accent', format: 'cost' },
            { key: 'budgetUsd', label: 'Budget', shape: 'line', tint: 'sage', format: 'cost' },
            { key: 'requests', label: 'Requests', shape: 'bar', tint: 'steel' },
          ]}
        />
      </Panel>

      <Panel title="Requests by endpoint">
        <BarList
          rows={DEMO_ENDPOINTS.map((e) => ({
            key: e.key,
            label: e.label,
            value: e.requests,
            display: formatCount(e.requests),
            caption: `${formatPercent(e.errorRate, 1)} errors · ${formatDuration(e.p95Ms)} p95`,
          }))}
          limit={5}
          moreLabel="other endpoints"
          formatTotal={formatCount}
          // One bar carries the accent — the busiest endpoint, which is what
          // this panel exists to name. The rest are the population.
          highlight={DEMO_ENDPOINTS[0]!.key}
        />
      </Panel>

      <Panel title="Where the time goes">
        <CompositionBar
          slices={[
            { key: 'db', label: 'Database', value: 42 },
            { key: 'upstream', label: 'Upstream APIs', value: 27 },
            { key: 'render', label: 'Rendering', value: 18 },
            { key: 'queue', label: 'Queue wait', value: 9 },
            { key: 'other', label: 'Other', value: 4 },
          ]}
          format={(v) => `${v}%`}
        />
      </Panel>
    </DashboardPage>
  );
}
