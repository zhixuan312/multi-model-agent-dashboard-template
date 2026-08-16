import {
  Activity,
  BarChart3,
  HeartPulse,
  ListTree,
  Palette,
  Settings,
  type LucideIcon,
} from 'lucide-react';

/**
 * ── EDIT ME FIRST ────────────────────────────────────────────────────────
 * The whole primary navigation, in one place. `Sidebar` renders this and owns
 * no route knowledge of its own, so adding a page is a route file plus a line
 * here — never a component edit.
 */

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** The root item owns `/` exactly; every other item matches its own prefix. */
  exact?: boolean;
}

export interface NavSection {
  id: string;
  /** Renders as a small eyebrow above the group. Omit for the first group. */
  label?: string;
  items: NavItem[];
}

/**
 * Group by the KIND of question a page answers, not by how many pages you have.
 * A flat list of seven makes every page look equally important; two labelled
 * groups of three and four tell the reader where to start.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'analysis',
    items: [
      { href: '/', label: 'Overview', icon: BarChart3, exact: true },
      { href: '/records', label: 'Records', icon: ListTree },
      { href: '/activity', label: 'Activity', icon: Activity },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { href: '/health', label: 'Health', icon: HeartPulse },
      { href: '/settings', label: 'Settings', icon: Settings },
      // The design-system gallery. Keep it in the app, not in a separate
      // Storybook: a component reviewed outside the real shell, on a white
      // sheet, tells you nothing about how it sits on the actual page ground.
      { href: '/components', label: 'Components', icon: Palette },
    ],
  },
];

/** Shown in the browser tab, the sidebar wordmark, and the metadata. */
export const APP_NAME = 'Dashboard';
