import { SlidersHorizontal } from 'lucide-react';
import { DashboardPage } from '@/components/DashboardPage';
import { Panel } from '@/components/Panel';
import { EnvironmentFacts, SettingsForms } from './SettingsForms';

const NOTE = `- One \`FormPanel\` per concern — never one long form with a single Save
- The footer is owned by \`FormPanel\`, never hand-rolled at the call site
- A stored credential shows **set / not set**, never the value itself
- \`Field\` owns the label, hint, error and ARIA wiring — pass the control as a
  render prop rather than wiring \`aria-describedby\` yourself`;

/**
 * The settings preset: stacked forms in the 2/3 column, guidance and facts in
 * the rail. `align="start"` is what makes a short rail sit against the top of a
 * tall form instead of stretching to match it — `DashboardPage` leaves the
 * default, so if you want that look, reach for `PageShell` directly.
 */
export default function SettingsPage() {
  return (
    <DashboardPage
      title="Settings"
      description="Configuration for this workspace."
      showPeriod={false}
      note={NOTE}
      noteIcon={<SlidersHorizontal />}
      noteTitle="How forms work here"
      rail={
        <Panel title="Environment">
          <EnvironmentFacts />
        </Panel>
      }
    >
      <SettingsForms />
    </DashboardPage>
  );
}
