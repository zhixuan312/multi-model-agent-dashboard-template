import { CircleCheck, CircleSlash, ShieldCheck, TriangleAlert } from 'lucide-react';
import { DashboardPage } from '@/components/DashboardPage';
import { Panel } from '@/components/Panel';
import { Badge, Banner, EmptyState } from '@/components/ui';
import { List, type ListRow } from '@/components/patterns/list';
import { DEMO_CHECKS, DEMO_NOW, DEMO_STALE_AFTER_MS, DEMO_UPDATED_AT, type DemoCheck } from '@/data/demo';

const STATE_VARIANT: Record<DemoCheck['state'], 'sage' | 'amber' | 'rose'> = {
  ok: 'sage',
  warn: 'amber',
  down: 'rose',
};

const NOTE = `- **ok** — measured, and within its threshold
- **warn** — measured, trending the wrong way
- **down** — the check itself failed

An unmeasured check is never reported as \`ok\`. If you cannot measure it, say so
— a green tile nobody checked is worse than no tile at all.`;

function toRow(check: DemoCheck): ListRow {
  return {
    id: check.key,
    primary: check.label,
    secondary: check.detail,
    trailing: (
      <Badge variant={STATE_VARIANT[check.state]} dot size="sm">
        {check.state}
      </Badge>
    ),
  };
}

export default function HealthPage() {
  const failing = DEMO_CHECKS.filter((c) => c.state !== 'ok');
  const down = DEMO_CHECKS.filter((c) => c.state === 'down');
  const warn = DEMO_CHECKS.filter((c) => c.state === 'warn');
  const ok = DEMO_CHECKS.filter((c) => c.state === 'ok');

  return (
    <DashboardPage
      title="Health"
      updatedAt={DEMO_UPDATED_AT}
      staleAfterMs={DEMO_STALE_AFTER_MS}
      now={DEMO_NOW}
      description="Every dependency this service needs, and whether it answered."
      showPeriod={false}
      note={NOTE}
      noteIcon={<ShieldCheck />}
      noteTitle="What these mean"
      // The status row is the dominant object even on a page that is mostly a
      // list: "1 down" answers the question the page exists for before anyone
      // reads a row. `down` carries the attention rail; nothing carries the
      // accent, because the finding here is a failure, not a headline.
      metrics={[
        {
          label: 'Down',
          value: down.length,
          icon: <CircleSlash />,
          tone: down.length > 0 ? 'attention' : undefined,
          muted: down.length === 0,
          sublabel: 'checks that did not answer',
        },
        {
          label: 'Warning',
          value: warn.length,
          icon: <TriangleAlert />,
          muted: warn.length === 0,
          sublabel: 'measured, trending wrong',
        },
        {
          label: 'Healthy',
          value: ok.length,
          icon: <CircleCheck />,
          sublabel: `of ${DEMO_CHECKS.length} monitored`,
        },
      ]}
      rail={
        // No `data-rail-fill`: this list is three rows on a good day, and a
        // short list stretched down a 700px column is an empty bordered box.
        failing.length === 0 ? (
          <Panel title="Needs attention">
            <EmptyState
              icon={<CircleCheck />}
              title="All clear"
              description="Every check reported inside its threshold."
            />
          </Panel>
        ) : (
          <List sections={[{ id: 'failing', header: 'Needs attention', rows: failing.map(toRow) }]} />
        )
      }
    >
      {down.length > 0 ? (
        <Banner
          variant="danger"
          title="A dependency is down"
          description="Billing sync has not completed for 6 hours. Invoices generated in this window will be incomplete."
        />
      ) : null}

      {/* `List` renders its own Card, so it goes in the column DIRECTLY.
          Wrapping it in a `Panel` draws a second border around the first and the
          rows end up inset by two frames — the double-framing that `PageShell`
          documents, and that this page had until the two borders were looked at
          side by side. */}
      <List sections={[{ id: 'all', header: 'All checks', rows: DEMO_CHECKS.map(toRow) }]} />
    </DashboardPage>
  );
}
