import { CalendarClock } from 'lucide-react';
import { DashboardPage } from '@/components/DashboardPage';
import { Panel } from '@/components/Panel';
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap';
import { BarList } from '@/components/charts/BarList';
import { formatCount } from '@/lib/format';
import { DISPLAY_TIMEZONE } from '@/lib/format-date';
import { parsePeriod } from '@/lib/period';
import { DEMO_NOW, DEMO_STALE_AFTER_MS, DEMO_UPDATED_AT, demoHeatmap } from '@/data/demo';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const NOTE = `A daily total cannot tell you whether Tuesday is busy all day or spikes for one
hour, and an hourly total cannot tell you whether that hour is a weekday habit
or a weekend catch-up. The grid answers both.

Intensity is **linear** against the busiest cell, not a square root — on a
typical corpus a square-root ramp puts the median near 50% and every cell comes
out the same mid-tone.`;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const period = parsePeriod((await searchParams).period);
  const cells = demoHeatmap(period);

  const byDay = DAYS.map((label, weekday) => ({
    key: label,
    label,
    value: cells.filter((c) => c.weekday === weekday).reduce((n, c) => n + c.value, 0),
  }));
  const busiest = [...byDay].sort((a, b) => b.value - a.value)[0]!;
  const total = byDay.reduce((n, d) => n + d.value, 0);

  return (
    <DashboardPage
      title="Activity"
      updatedAt={DEMO_UPDATED_AT}
      staleAfterMs={DEMO_STALE_AFTER_MS}
      now={DEMO_NOW}
      description="Weekday and hour-of-day distribution across the period."
      note={NOTE}
      noteIcon={<CalendarClock />}
      noteTitle="Reading the grid"
      // These three were a `Distribution` facts panel in the rail, which said
      // the same things the metric row says — in 13px type, below the fold, in
      // a box that stretched. A number that answers the page's question belongs
      // at the top in the display register, not in a sidebar list. The rail is
      // now just the note, which is what a rail is for.
      metrics={[
        {
          label: 'Total',
          value: formatCount(total),
          emphasis: true,
          sublabel: `requests, ${DISPLAY_TIMEZONE}`,
        },
        {
          label: 'Busiest day',
          value: busiest.label,
          sublabel: `${formatCount(busiest.value)} requests`,
        },
        {
          label: 'Weekend share',
          value: `${Math.round(((byDay[5]!.value + byDay[6]!.value) / total) * 100)}%`,
          sublabel: 'of all activity',
        },
      ]}
    >
      <Panel title="Weekday × hour">
        <ActivityHeatmap cells={cells} unitLabel="requests" />
      </Panel>

      <Panel title="By weekday">
        <BarList
          rows={byDay.map((d) => ({ ...d, display: formatCount(d.value) }))}
          formatTotal={formatCount}
          highlight={busiest.key}
        />
      </Panel>
    </DashboardPage>
  );
}
