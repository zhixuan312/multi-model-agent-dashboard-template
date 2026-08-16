import { Card, CardContent } from '@/components/ui';
import { DashboardPage } from '@/components/DashboardPage';
import { demoRecords } from '@/data/demo';
import { RecordsTable } from './RecordsTable';

/**
 * The wide-table preset: no rail, no note, `scroll="inner"`.
 *
 * With neither `note` nor `rail`, `PageShell` drops the 1/3 column and the table
 * gets the full width — which is what a table with seven columns wants. Adding a
 * rail here would cost about a third of the columns.
 */
export default function RecordsPage() {
  const rows = demoRecords();

  return (
    <DashboardPage
      title="Records"
      description="Every individual request in the period, newest first."
      showPeriod={false}
      scroll="inner"
    >
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <RecordsTable rows={rows} />
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
