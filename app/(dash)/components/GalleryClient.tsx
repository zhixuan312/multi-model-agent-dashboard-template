'use client';

import { useState } from 'react';
import { Check, Copy, Download, Plus, Search, Trash2 } from 'lucide-react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Display,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  Eyebrow,
  Field,
  FieldGrid,
  Freshness,
  Grid,
  IconButton,
  Input,
  Label,
  Micro,
  Mono,
  Section,
  SectionTitle,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  TextSm,
  TextStrong,
  Textarea,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { showToast } from '@/components/ui/toast';

/** One labelled specimen. The label is what makes a gallery a reference. */
function Specimen({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Micro className="text-ink-faint">{name}</Micro>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

const DEMO_NOW = new Date('2026-08-16T09:00:00+08:00');

export function GalleryClient() {
  const [on, setOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [seg, setSeg] = useState('comfortable');
  const [sel, setSel] = useState('30d');
  const [text, setText] = useState('Acme Production');

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <Micro className="text-ink-faint">7 sizes · 3 weights · no serif</Micro>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="t-stat">213,921</span>
            <Micro className="text-ink-faint">t-stat · 40px / 600 / −0.022em / tabular</Micro>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <Display>Display heading</Display>
            <Micro className="text-ink-faint">t-display · 32px / 600</Micro>
          </div>
          <div className="flex flex-col gap-1">
            <Title>Title — the page and section rung</Title>
            <Micro className="text-ink-faint">t-title · 22px / 600</Micro>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <Text>
              Body copy carries the reasoning. Hierarchy comes from weight and size, not from a
              second typeface — a serif headline reads as editorial voice, and an interface has a
              hierarchy rather than a voice.
            </Text>
            <Micro className="text-ink-faint">t-body · 14px / 400</Micro>
          </div>
          <div className="flex flex-col gap-1">
            <TextSm>Small is for captions, meta and dense cells.</TextSm>
            <Micro className="text-ink-faint">t-sm · 12px / 400</Micro>
          </div>
          <div className="flex flex-col gap-1">
            <Eyebrow>Eyebrow · uppercase · 0.04em</Eyebrow>
            <Micro className="text-ink-faint">t-eyebrow · 11px / 500 — sans, not mono</Micro>
          </div>
          <div className="flex flex-col gap-1">
            <Mono>rec_1f4a · 08:41:22 · sha 9c1e77</Mono>
            <Micro className="text-ink-faint">
              t-mono · 12px — reserved for identifiers and code, never for labels
            </Micro>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Surfaces</CardTitle>
          <Micro className="text-ink-faint">the weight ladder — pick by importance</Micro>
        </CardHeader>
        <CardContent>
          <Grid min="200px" gap="sm">
            {(['flat', 'default', 'soft', 'hard'] as const).map((w) => (
              <Card key={w} weight={w}>
                <CardContent className="flex flex-col gap-1">
                  <Eyebrow>{w}</Eyebrow>
                  <TextSm>
                    {w === 'flat'
                      ? 'grouping by space'
                      : w === 'default'
                        ? 'a real object'
                        : w === 'soft'
                          ? 'quiet context'
                          : 'one per screen'}
                  </TextSm>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Specimen name="Button — variants">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </Specimen>
          <Specimen name="Button — states">
            <Button leftIcon={<Plus />}>With icon</Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
          </Specimen>
          <Specimen name="Icon button · tooltip · menu">
            <IconButton aria-label="Copy" icon={<Copy />} />
            <IconButton aria-label="Delete" icon={<Trash2 />} variant="danger" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" leftIcon={<Download />}>
                  Hover me
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exports the current period as CSV</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="secondary"
              onClick={() => showToast({ type: 'success', message: 'Settings updated.' })}
            >
              Toast
            </Button>
          </Specimen>
          <Specimen name="Toggle · check · segmented · select">
            <Switch checked={on} onCheckedChange={setOn} aria-label="Failure alerts" />
            <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} aria-label="Include archived" />
            <Segmented
              label="Density"
              value={seg}
              onChange={setSeg}
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' },
              ]}
            />
            <Select value={sel} onValueChange={setSel}>
              <SelectTrigger className="w-[150px]" aria-label="Period">
                <SelectValue>{sel === '30d' ? 'Last 30 days' : 'Last 7 days'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </Specimen>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form</CardTitle>
          <Micro className="text-ink-faint">Field owns label · hint · error · ARIA</Micro>
        </CardHeader>
        <CardContent>
          <FieldGrid cols={2}>
            <Field label="Workspace" hint="Shown on the overview." required>
              {(p) => <Input {...p} value={text} onChange={(e) => setText(e.target.value)} />}
            </Field>
            <Field label="Contact" error="Enter a valid email address.">
              {(p) => <Input {...p} defaultValue="ops@" />}
            </Field>
            <Field label="Description" className="sm:col-span-2">
              {(p) => <Textarea {...p} rows={2} defaultValue="Primary customer-facing environment." />}
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <Micro className="text-ink-faint">reserved hues — never a chart series</Micro>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Specimen name="Badge">
            <Badge>neutral</Badge>
            <Badge variant="accent">accent</Badge>
            <Badge variant="sage" dot>
              ok
            </Badge>
            <Badge variant="amber" dot>
              warn
            </Badge>
            <Badge variant="rose" dot>
              down
            </Badge>
            <Badge variant="steel">steel</Badge>
          </Specimen>
          <Specimen name="Freshness">
            <Freshness at={new Date(DEMO_NOW.getTime() - 4 * 60_000)} staleAfterMs={15 * 60_000} now={DEMO_NOW} />
            <Freshness at={new Date(DEMO_NOW.getTime() - 90 * 60_000)} staleAfterMs={15 * 60_000} now={DEMO_NOW} />
            <Freshness at={null} now={DEMO_NOW} />
          </Specimen>
          <Specimen name="Avatar · spinner">
            <Avatar name="Mina Okafor" />
            <AvatarGroup members={[{ name: 'Mina Okafor' }, { name: 'Ravi Shah' }, { name: 'Dana Lee' }, { name: 'Sam Ng' }]} />
            <Spinner />
          </Specimen>
          <div className="flex flex-col gap-2">
            <Micro className="text-ink-faint">Banner</Micro>
            <Banner variant="info" title="Info" description="A neutral, non-blocking note." />
            <Banner variant="success" title="Success" description="The change was applied." />
            <Banner variant="warning" title="Warning" description="Approaching the plan limit." />
            <Banner variant="danger" title="Danger" description="Billing sync has not completed for 6 hours." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table</CardTitle>
          <Micro className="text-ink-faint">numerics right-aligned · tabular · 44px rows</Micro>
        </CardHeader>
        {/* `overflow-x-auto` on the body. `Panel` adds this for you when you pass
            `padded={false}`; a bare `Card` does not, and without it the table is
            43px wider than the card on a phone with nothing to scroll — the last
            columns are simply unreachable. */}
        <CardContent className="overflow-x-auto px-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">p95</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ['GET /v1/search', 'ok', '48,120', '310ms'],
                ['POST /v1/documents', 'warn', '31,540', '880ms'],
                ['GET /v1/exports', 'down', '9,430', '2.2s'],
              ].map(([ep, st, req, p95]) => (
                <TableRow key={ep} className="h-11">
                  <TableCell>{ep}</TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      dot
                      variant={st === 'ok' ? 'sage' : st === 'warn' ? 'amber' : 'rose'}
                    >
                      {st}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{req}</TableCell>
                  <TableCell className="text-right tabular-nums">{p95}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Grid min="360px" gap="sm">
        <Card>
          <CardHeader>
            <CardTitle>Empty state</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Search />}
              title="No records match"
              description="Nothing matches this filter. Clear it to see all 120 records."
              action={<Button variant="secondary">Clear filter</Button>}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <Micro className="text-ink-faint">skeletons match the real shape</Micro>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[70, 45, 60].map((w, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-4">
                  <Skeleton className="h-3.5" style={{ width: `${w}%` }} />
                  <Skeleton className="h-3.5 w-12" />
                </div>
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Section>
        <SectionTitle>Section title</SectionTitle>
        <div className="flex flex-wrap items-center gap-3">
          <TextStrong>Strong body</TextStrong>
          <Label>Label</Label>
          <Check className="size-4 text-[var(--green)]" aria-hidden />
        </div>
      </Section>
    </div>
  );
}
