'use client';

import { useState } from 'react';
import { Field, FieldGrid, Input, Segmented, Switch, Textarea } from '@/components/ui';
import { FormPanel, SetIndicator } from '@/components/patterns/form-panel';
import { Stat } from '@/components/StatRow';

/**
 * The settings preset: `FormPanel` in both of its modes.
 *
 * The always-open form is a plain page form. The disclosure form is the
 * credential pattern — a read view describing the saved value, never revealing
 * it, with an Edit affordance that opens the fields.
 */
export function SettingsForms() {
  const [name, setName] = useState('Acme Production');
  const [contact, setContact] = useState('ops@example.com');
  const [summary, setSummary] = useState('Primary customer-facing environment.');
  const [density, setDensity] = useState('comfortable');
  const [alerts, setAlerts] = useState(true);
  const [busy, setBusy] = useState(false);

  const [keyOpen, setKeyOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [keySet, setKeySet] = useState(true);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; detail: string } | null>(null);

  const nameError = name.trim() ? undefined : 'A workspace needs a name.';

  async function save() {
    setBusy(true);
    // Stand-in for the mutation. Replace with your server action or fetch.
    await new Promise((r) => setTimeout(r, 400));
    setBusy(false);
  }

  return (
    <>
      <FormPanel
        ariaLabel="Workspace settings"
        heading="Workspace"
        onSubmit={save}
        busy={busy}
        canSave={!nameError}
      >
        <FieldGrid cols={2}>
          <Field label="Name" required error={nameError}>
            {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label="Contact" hint="Where alerts are sent.">
            {(p) => (
              <Input {...p} type="email" value={contact} onChange={(e) => setContact(e.target.value)} />
            )}
          </Field>
          <Field label="Description" className="sm:col-span-2" hint="Shown on the overview.">
            {(p) => (
              <Textarea {...p} rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
            )}
          </Field>
        </FieldGrid>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-ink">Table density</p>
              <p className="text-xs text-ink-faint">Applies to every data grid in the app.</p>
            </div>
            <Segmented
              label="Table density"
              value={density}
              onChange={setDensity}
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' },
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-ink">Failure alerts</p>
              <p className="text-xs text-ink-faint">Email the contact when a check goes down.</p>
            </div>
            <Switch checked={alerts} onCheckedChange={setAlerts} aria-label="Failure alerts" />
          </div>
        </div>
      </FormPanel>

      <FormPanel
        ariaLabel="Edit API key"
        heading="API key"
        indicator={<SetIndicator set={keySet} />}
        disclosure={{
          open: keyOpen,
          summary: keySet ? 'Set — last rotated 12 days ago' : 'No key stored',
          onEdit: () => setKeyOpen(true),
        }}
        onCancel={() => {
          setKeyOpen(false);
          setResult(null);
        }}
        onSubmit={async () => {
          await save();
          setKeySet(Boolean(apiKey.trim()));
          setKeyOpen(false);
        }}
        busy={busy}
        validate={{
          validating,
          result,
          onValidate: async () => {
            setValidating(true);
            await new Promise((r) => setTimeout(r, 600));
            setResult(
              apiKey.trim().length >= 12
                ? { ok: true, detail: 'Authenticated against the demo endpoint.' }
                : { ok: false, detail: 'Key rejected — expected at least 12 characters.' },
            );
            setValidating(false);
          },
        }}
      >
        <Field label="Key" hint="Stored encrypted; never returned to the browser.">
          {(p) => (
            <Input
              {...p}
              type="password"
              value={apiKey}
              placeholder="sk_live_…"
              onChange={(e) => setApiKey(e.target.value)}
            />
          )}
        </Field>
      </FormPanel>
    </>
  );
}

/** The read-only facts panel that sits in the rail beside the forms. */
export function EnvironmentFacts() {
  return (
    <dl>
      <Stat label="Region" value="ap-southeast-1" />
      <Stat label="Plan" value="Scale" />
      <Stat label="Seats" value="24 of 50" />
      <Stat label="Created" value="14 Feb 2026" />
    </dl>
  );
}
