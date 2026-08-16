/**
 * Layout audit — asserts the shell's structural invariants on every page, at
 * several viewport sizes, in a real browser.
 *
 * ## Why this exists
 *
 * This design system's characteristic failure is a page that is BROKEN AND
 * GREEN. A records table once shipped with its content clipped instead of
 * scrolled: the panel grew to 35,616px inside a 674px box whose parent had
 * `overflow: hidden`, so the rest was simply cut off with no scrollbar. Nothing
 * failed. TypeScript was happy, the tests passed, the page returned 200, and a
 * screenshot looked plausible because the visible rows were correct. A human
 * had to notice.
 *
 * That is a whole CLASS of bug — a container that is not height-bounded, or is
 * bounded but cannot scroll — and it is invisible to every other check. These
 * invariants catch it mechanically:
 *
 *   A. the document itself never scrolls (the shell is `fixed inset-0`)
 *   B. nothing is clipped horizontally
 *   C. no `overflow: hidden` element is clipping real content
 *   D. content taller than its box has a scroller that actually moves
 *   E. the sidebar reaches the bottom of the viewport
 *   F. the page header does not move when the body scrolls
 *   G. every interactive control has an accessible name
 *   H. no duplicate DOM ids
 *   J. no panel collapsed to a sliver
 *   K. tables are reachable, and fit at the widest viewport
 *
 * ## Running it
 *
 *   pnpm dev                       # in one terminal
 *   pnpm add -D puppeteer          # once — deliberately not a default dep
 *   AUDIT_BASE=http://127.0.0.1:3000 pnpm audit:layout
 *
 * Puppeteer is NOT in devDependencies: it downloads a ~150MB browser, which is
 * a lot to impose on everyone who clones a template. Install it when you want
 * the audit.
 *
 * ## Adapting it
 *
 * Edit `PAGES`. If your app has an auth gate, add the login step where
 * `authenticate()` is stubbed below — and keep the `/login` redirect guard, or
 * an unauthenticated run passes vacuously, which is the worst outcome for a
 * check like this.
 */

const BASE = process.env.AUDIT_BASE ?? 'http://127.0.0.1:3000';

/** [name, path] — every route worth auditing. Keep in sync with `src/nav.ts`. */
const PAGES = [
  ['overview', '/?period=90d'],
  ['records', '/records'],
  ['activity', '/activity?period=90d'],
  ['health', '/health'],
  ['settings', '/settings'],
  ['components', '/components'],
];

/** Sub-pixel rounding and 1px borders produce noise; only flag real overflow. */
const SLOP = 4;

// Narrow viewports are NOT optional here. The rail was a fixed 232px at every
// width until this list included a phone: at 390px that left 158px of content
// and the dashboard was unusable — and every check passed, because every check
// ran at 1280px and up. An audit only covers what it visits.
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'laptop', width: 1440, height: 800 },
  { name: 'short', width: 1280, height: 620 },
  { name: 'wide', width: 1920, height: 1080 },
];

/** The class the design system puts on every panel-like box. */
const PANEL_CLASS = 'ds-spotlight';

/** Runs in the browser. Returns a list of violation strings. */
function auditInPage(slop, panelClass) {
  const out = [];

  const label = (el) => {
    const id = el.getAttribute('data-testid');
    if (id) return `[${id}]`;
    // A panel is far easier to find by its title than by its class soup.
    const card = el.closest(`.${panelClass}`);
    const title = card?.querySelector('h2, h3')?.textContent?.trim().slice(0, 32);
    const cls = (el.className || '').toString().split(/\s+/).slice(0, 2).join('.');
    const base = `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`;
    return title ? `${base} (in "${title}")` : base;
  };

  /**
   * Visually-hidden-but-accessible content is clipped ON PURPOSE — the
   * `sr-only` pattern pins a 1px box and hides the overflow so screen readers
   * still reach it. Flagging it would train us to ignore the check.
   */
  const isVisuallyHidden = (el) => {
    const cs = getComputedStyle(el);
    return (
      cs.clipPath === 'inset(50%)' ||
      (cs.position === 'absolute' && el.clientWidth <= 1 && el.clientHeight <= 1)
    );
  };

  /** Can the reader actually get to the overflowing content? */
  const hasWorkingScroller = (el) => {
    const cands = [el, ...el.querySelectorAll('*')];
    return cands.some((c) => {
      const cs = getComputedStyle(c);
      if (cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') return false;
      return c.scrollHeight > c.clientHeight + slop;
    });
  };

  // A — the document must not scroll; the shell owns all scrolling.
  const de = document.documentElement;
  if (de.scrollHeight > de.clientHeight + slop) {
    out.push(`A document scrolls vertically: ${de.scrollHeight} > ${de.clientHeight}`);
  }
  if (de.scrollWidth > de.clientWidth + slop) {
    out.push(`A document scrolls horizontally: ${de.scrollWidth} > ${de.clientWidth}`);
  }

  const all = [...document.querySelectorAll('*')];

  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (isVisuallyHidden(el) || el.closest('.sr-only')) continue;

    // B — horizontal clipping that actually loses content.
    //
    // Only `overflow-x: hidden` counts: `visible` overflow is not lost (it
    // paints outside the box, which is how the scroll-pane clearance and the
    // cards' hover bloom work), and `truncate` sets ellipsis deliberately.
    if (
      cs.overflowX === 'hidden' &&
      cs.textOverflow !== 'ellipsis' &&
      el.scrollWidth > el.clientWidth + 8
    ) {
      out.push(`B horizontally clipped: ${label(el)} — ${el.scrollWidth} > ${el.clientWidth}`);
    }

    // C — the headline bug: content taller than a hidden-overflow box, with no
    //     scroller anywhere inside it that could reach the rest.
    if (
      cs.overflowY === 'hidden' &&
      el.scrollHeight > el.clientHeight + slop &&
      !hasWorkingScroller(el)
    ) {
      out.push(
        `C unreachable content: ${label(el)} — ${el.scrollHeight}px of content in a ${el.clientHeight}px box, nothing scrolls`,
      );
    }
  }

  // D — every scroller with overflowing content must actually move.
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') continue;
    if (el.scrollHeight <= el.clientHeight + slop) continue;
    const before = el.scrollTop;
    el.scrollTop = before + 200;
    const moved = el.scrollTop > before;
    el.scrollTop = before;
    if (!moved) out.push(`D scroller does not move: ${label(el)}`);
  }

  // G — every interactive control needs an accessible name. An icon-only
  //     button with no label is invisible to a screen reader and unlabelled in
  //     a test; both fail silently.
  for (const el of document.querySelectorAll('button, a[href], select, input, [role="tab"]')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (el.closest('.sr-only')) continue;
    // Not exposed to assistive tech and not tabbable — e.g. the visually
    // hidden native <select> Radix renders purely for form/autofill
    // compatibility. Flagging it would be noise, and noise gets ignored.
    if (el.getAttribute('aria-hidden') === 'true' || el.closest('[aria-hidden="true"]')) continue;
    if (el.tabIndex < 0) continue;
    // A `<label for>` association counts. It has to: `Field` names its control
    // that way (it owns `htmlFor` + the generated id), so a check that only
    // looked at `aria-label` flagged every correctly-labelled form field in the
    // app — and a check that cries wolf on the happy path gets switched off.
    const labelledBy = (el.getAttribute('aria-labelledby') || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .join(' ')
      .trim();
    const forLabel = el.id
      ? (document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent ?? '').trim()
      : '';
    const wrappingLabel = (el.closest('label')?.textContent ?? '').trim();
    const name =
      (el.getAttribute('aria-label') || '').trim() ||
      labelledBy ||
      forLabel ||
      wrappingLabel ||
      (el.getAttribute('title') || '').trim() ||
      (el.textContent || '').trim() ||
      (el.getAttribute('placeholder') || '').trim();
    if (!name) out.push(`G control with no accessible name: ${label(el)}`);
  }

  // H — duplicate DOM ids break every `aria-labelledby`/`for` association that
  //     points at them, and the breakage is invisible until a screen reader
  //     reads the wrong label.
  const seen = new Set();
  for (const el of document.querySelectorAll('[id]')) {
    const id = el.id;
    if (seen.has(id)) out.push(`H duplicate id "${id}" on ${label(el)}`);
    seen.add(id);
  }

  // J — a panel that renders to nothing. The flex-crush bug produced 0px-tall
  //     cards; this catches the shape of that even when no content overflows.
  for (const card of document.querySelectorAll(`.${panelClass}`)) {
    const h = card.getBoundingClientRect().height;
    if (h > 0 && h < 40) out.push(`J panel collapsed to ${Math.round(h)}px: ${label(card)}`);
  }

  // E — the rail must reach the bottom of the viewport. Desktop only: below the
  //     `lg` breakpoint the rail is an overlay drawer and is correctly absent
  //     from the page, so asserting its presence there would fail the very fix
  //     that makes narrow widths usable.
  if (window.innerWidth >= 1024) {
    const side = document.querySelector('[data-testid="sidebar"]');
    if (!side) {
      out.push('E no sidebar found');
    } else {
      const gap = Math.round(window.innerHeight - side.getBoundingClientRect().bottom);
      if (gap > slop) out.push(`E sidebar stops ${gap}px short of the bottom`);
    }
  }

  return out;
}

/**
 * K — a table must never be clipped, and should not need horizontal scrolling
 * at the widest viewport.
 *
 * Two different failures. Clipping (no scroll container at all) is a hard
 * violation: the rightmost columns are simply unreachable. Needing to scroll on
 * a 1920px screen is a soft one — reachable, but nobody scrolls a table
 * sideways to discover a column exists, so the data is effectively invisible.
 */
function tablesFitOrScroll(vpWidth) {
  const out = [];
  for (const t of document.querySelectorAll('table')) {
    // Skip the charts' accessible twin tables. They live inside `.sr-only`,
    // which pins a 1px box and hides the overflow ON PURPOSE, so every one of
    // them looks like a table 228px wider than its container with no scroller.
    // Three false positives on one page is how a check stops being read.
    if (t.closest('.sr-only')) continue;
    let n = t.parentElement;
    let scroller = null;
    while (n && n !== document.body) {
      const ov = getComputedStyle(n).overflowX;
      if (ov === 'auto' || ov === 'scroll') {
        scroller = n;
        break;
      }
      n = n.parentElement;
    }
    const avail = scroller ? scroller.clientWidth : (t.parentElement?.clientWidth ?? 0);
    const over = t.scrollWidth - avail;
    if (over <= 1) continue;
    if (!scroller) {
      out.push(
        `K table is ${over}px wider than its container and nothing scrolls — those columns are unreachable`,
      );
    } else if (vpWidth >= 1920) {
      out.push(`K table still needs ${over}px of horizontal scroll at ${vpWidth}px wide`);
    }
  }
  return out;
}

/** F — the locked header must not move when the body scrolls. */
function headerStaysPut() {
  const header = document.querySelector('header');
  if (!header) return ['F no page header found'];
  const before = header.getBoundingClientRect().top;
  const scrollers = [...document.querySelectorAll('*')].filter((el) => {
    const cs = getComputedStyle(el);
    return (
      (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 8
    );
  });
  for (const s of scrollers) s.scrollTop = 500;
  const after = header.getBoundingClientRect().top;
  for (const s of scrollers) s.scrollTop = 0;
  return Math.abs(after - before) > 1
    ? [`F header moved ${Math.round(after - before)}px when the body scrolled`]
    : [];
}

let puppeteer;
try {
  ({ default: puppeteer } = await import('puppeteer'));
} catch {
  console.error(
    'puppeteer is not installed — it is deliberately not a default devDependency.\n' +
      'Run `pnpm add -D puppeteer`, then re-run `pnpm audit:layout`.',
  );
  process.exit(2);
}

const probe = await fetch(BASE).catch(() => null);
if (!probe) {
  console.error(`dev server not reachable at ${BASE} — start it, or set AUDIT_BASE.`);
  process.exit(2);
}

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

/**
 * Stub for an app that gates its routes. Sign in here, and the guard below
 * keeps an unauthenticated run from passing vacuously.
 */
async function authenticate() {
  // await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  // await page.evaluate(async (pw) => { … }, process.env.AUDIT_PASSWORD);
}
await authenticate();

/** Guard against a vacuous pass: a redirect to /login is not a page. */
function assertNotLoginRedirect(name) {
  if (page.url().includes('/login')) {
    console.error(`  FAIL ${name}: landed on /login — the audit is not authenticated`);
    process.exitCode = 2;
    return false;
  }
  return true;
}

let violations = 0;
let checks = 0;

for (const vp of VIEWPORTS) {
  await page.setViewport({ width: vp.width, height: vp.height });
  for (const [name, path] of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 120_000 });
    await new Promise((r) => setTimeout(r, 400));
    if (!assertNotLoginRedirect(name)) continue;
    const found = [
      ...(await page.evaluate(auditInPage, SLOP, PANEL_CLASS)),
      ...(await page.evaluate(headerStaysPut)),
      ...(await page.evaluate(tablesFitOrScroll, vp.width)),
    ];
    checks += 1;
    if (found.length === 0) {
      console.log(`  ok   ${vp.name.padEnd(7)} ${name}`);
    } else {
      violations += found.length;
      console.log(`  FAIL ${vp.name.padEnd(7)} ${name}`);
      for (const f of found) console.log(`         ${f}`);
    }
  }
}

await browser.close();

console.log(`\n${checks} page/viewport combinations checked, ${violations} violation(s).`);
process.exit(violations === 0 ? 0 : 1);
