import { formatIsoDate } from '@/lib/format-date';
import { PERIOD_DAYS, type Period } from '@/lib/period';
import type { TrendPoint } from '@/components/charts/TrendChart';
import type { HeatCell } from '@/components/charts/ActivityHeatmap';

/**
 * ── DELETE ME ────────────────────────────────────────────────────────────
 * A deterministic fake dataset so the template runs, and looks like a real
 * product, with no database. Replace this module with your queries; the pages
 * import from here and nowhere else, so the seam is one directory.
 *
 * DETERMINISTIC ON PURPOSE. `Math.random()` here would produce different
 * numbers on the server and on the client and React would report a hydration
 * mismatch — which reads as a framework bug and is really a data bug. Seeded
 * values render identically in both passes, which is also what makes the
 * snapshot tests in `tests/` meaningful.
 *
 * Time is derived from a FIXED epoch rather than `Date.now()` for the same
 * reason: a server rendering at 23:59:59.9 and a client hydrating at 00:00:00.1
 * would disagree about what "today" is.
 */

/** The demo clock. Everything below is relative to this instant. */
export const DEMO_NOW = new Date('2026-08-16T09:00:00+08:00');

/**
 * When the pipeline last delivered. Real apps read this from the store (the
 * MAX ingest timestamp, not `now()`) — the point of the stamp is to expose a
 * pipeline that has stopped, and a clock read at render time can never do that.
 */
export const DEMO_UPDATED_AT = new Date(DEMO_NOW.getTime() - 4 * 60_000);

/** Past this age the data is late rather than merely recent. */
export const DEMO_STALE_AFTER_MS = 15 * 60_000;

/** Mulberry32 — small, fast, and stable across platforms and Node versions. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysFor(period: Period): number {
  // `all` in the demo corpus is 180 days — long enough that the seasonal shape
  // in the trend is visible, short enough to stay readable at chart width.
  return PERIOD_DAYS[period] ?? 180;
}

export interface DemoTotals {
  requests: number;
  errorRate: number;
  p95Ms: number;
  spendUsd: number;
  /** Same four, one period earlier, so the tiles can show a delta. */
  previous: { requests: number; errorRate: number; p95Ms: number; spendUsd: number };
}

/** Daily series for the trend chart: spend (area), forecast (line), requests (bars). */
export function demoTrend(period: Period): TrendPoint[] {
  const days = daysFor(period);
  const rand = seeded(0x5eed + days);
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(DEMO_NOW.getTime() - i * 86_400_000);
    const weekday = day.getUTCDay();
    // Weekends run about 40% of a weekday, which is what makes the heatmap and
    // the trend tell the same story.
    const weekly = weekday === 0 || weekday === 6 ? 0.42 : 1;
    const drift = 1 + (days - i) / (days * 3);
    const noise = 0.82 + rand() * 0.36;
    const requests = Math.round(2400 * weekly * drift * noise);
    points.push({
      date: formatIsoDate(day),
      requests,
      spendUsd: Number((requests * 0.0031 * (0.9 + rand() * 0.2)).toFixed(2)),
      budgetUsd: Number((2400 * drift * 0.0031).toFixed(2)),
    });
  }
  return points;
}

export function demoTotals(period: Period): DemoTotals {
  const trend = demoTrend(period);
  const rand = seeded(0xbeef + trend.length);
  const requests = trend.reduce((n, p) => n + (p.requests as number), 0);
  const spendUsd = trend.reduce((n, p) => n + (p.spendUsd as number), 0);
  return {
    requests,
    errorRate: 0.0126,
    p95Ms: 412,
    spendUsd: Number(spendUsd.toFixed(2)),
    previous: {
      requests: Math.round(requests * (0.88 + rand() * 0.08)),
      errorRate: 0.0171,
      p95Ms: 455,
      spendUsd: Number((spendUsd * (0.9 + rand() * 0.1)).toFixed(2)),
    },
  };
}

/** Weekday × hour buckets, in `DISPLAY_TIMEZONE`. */
export function demoHeatmap(period: Period): HeatCell[] {
  const rand = seeded(0xca11 + daysFor(period));
  const cells: HeatCell[] = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    for (let hour = 0; hour < 24; hour++) {
      // Office hours in the display timezone, tailing off either side.
      const business = hour >= 9 && hour <= 18 ? 1 : hour >= 7 && hour <= 21 ? 0.4 : 0.08;
      const weekly = weekday >= 5 ? 0.35 : 1;
      cells.push({
        weekday,
        hour,
        value: Math.round(180 * business * weekly * (0.6 + rand() * 0.8)),
      });
    }
  }
  return cells;
}

export interface DemoEndpoint {
  key: string;
  label: string;
  requests: number;
  errorRate: number;
  p95Ms: number;
}

export const DEMO_ENDPOINTS: DemoEndpoint[] = [
  { key: 'search', label: 'GET /v1/search', requests: 48_120, errorRate: 0.004, p95Ms: 310 },
  { key: 'documents', label: 'POST /v1/documents', requests: 31_540, errorRate: 0.019, p95Ms: 880 },
  { key: 'sessions', label: 'POST /v1/sessions', requests: 22_870, errorRate: 0.002, p95Ms: 140 },
  { key: 'exports', label: 'GET /v1/exports', requests: 9_430, errorRate: 0.058, p95Ms: 2_240 },
  { key: 'webhooks', label: 'POST /v1/webhooks', requests: 6_210, errorRate: 0.011, p95Ms: 190 },
  { key: 'health', label: 'GET /v1/health', requests: 4_980, errorRate: 0, p95Ms: 12 },
];

export interface DemoRecord {
  id: string;
  endpoint: string;
  region: string;
  status: 'ok' | 'degraded' | 'failed';
  durationMs: number;
  costUsd: number;
  at: string;
}

const REGIONS = ['ap-southeast-1', 'us-east-1', 'eu-west-1', 'us-west-2'];
const STATUSES: DemoRecord['status'][] = ['ok', 'ok', 'ok', 'ok', 'ok', 'degraded', 'failed'];

/** A page of individual records, for the data-table demo. */
export function demoRecords(count = 120): DemoRecord[] {
  const rand = seeded(0xd0c5);
  return Array.from({ length: count }, (_, i) => {
    const endpoint = DEMO_ENDPOINTS[Math.floor(rand() * DEMO_ENDPOINTS.length)]!;
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]!;
    return {
      id: `rec_${(0x1000 + i).toString(16)}`,
      endpoint: endpoint.label,
      region: REGIONS[Math.floor(rand() * REGIONS.length)]!,
      status,
      durationMs: Math.round(endpoint.p95Ms * (0.3 + rand() * 0.9)),
      costUsd: Number((rand() * 0.04).toFixed(4)),
      at: new Date(DEMO_NOW.getTime() - i * 137_000).toISOString(),
    };
  });
}

export interface DemoCheck {
  key: string;
  label: string;
  state: 'ok' | 'warn' | 'down';
  detail: string;
}

export const DEMO_CHECKS: DemoCheck[] = [
  { key: 'ingest', label: 'Ingest pipeline', state: 'ok', detail: 'Last event 40 s ago' },
  { key: 'db', label: 'Primary database', state: 'ok', detail: 'Replication lag 120 ms' },
  { key: 'queue', label: 'Export queue', state: 'warn', detail: '1,204 jobs pending, rising' },
  { key: 'cdn', label: 'Edge cache', state: 'ok', detail: '98.2% hit rate' },
  { key: 'billing', label: 'Billing sync', state: 'down', detail: 'Last successful sync 6 h ago' },
];
