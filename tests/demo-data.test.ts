import { demoHeatmap, demoRecords, demoTotals, demoTrend } from '@/data/demo';

/**
 * The demo data is seeded rather than random for one reason: a server render
 * and a client hydration must produce identical markup, or React reports a
 * hydration mismatch that reads as a framework bug. These tests are what stops
 * someone "simplifying" the seeded PRNG back to `Math.random()`.
 *
 * Delete this file when you delete `src/data/demo.ts`.
 */
describe('demo data determinism', () => {
  it('returns identical trend points on repeated calls', () => {
    expect(demoTrend('30d')).toEqual(demoTrend('30d'));
  });

  it('returns identical totals on repeated calls', () => {
    expect(demoTotals('7d')).toEqual(demoTotals('7d'));
  });

  it('returns identical records on repeated calls', () => {
    expect(demoRecords(20)).toEqual(demoRecords(20));
  });

  it('returns identical heatmaps on repeated calls', () => {
    expect(demoHeatmap('90d')).toEqual(demoHeatmap('90d'));
  });
});

describe('demo data shape', () => {
  it('produces one point per day of the period', () => {
    expect(demoTrend('7d')).toHaveLength(7);
    expect(demoTrend('30d')).toHaveLength(30);
  });

  it('produces a full weekday × hour grid', () => {
    expect(demoHeatmap('30d')).toHaveLength(7 * 24);
  });

  it('keeps trend totals consistent with the headline totals', () => {
    const totals = demoTotals('30d');
    const summed = demoTrend('30d').reduce((n, p) => n + (p.requests as number), 0);
    expect(totals.requests).toBe(summed);
  });
});
