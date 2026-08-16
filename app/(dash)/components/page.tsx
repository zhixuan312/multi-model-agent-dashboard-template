import { Palette } from 'lucide-react';
import { DashboardPage } from '@/components/DashboardPage';
import { GalleryClient } from './GalleryClient';

const NOTE = `Every primitive on one page, at the same time, in the theme you are
looking at. Components that are only ever reviewed one at a time drift — two
greys, two radii, two label treatments — and each one looks fine in isolation.

Check it after any token change, and check it in **both themes**: the toggle is
in the sidebar. Most palette mistakes are invisible in the theme you designed in.`;

/**
 * The gallery.
 *
 * It exists because "does this component look right?" is the wrong question —
 * the right one is "do these components look like they came from the same
 * place?", and that can only be answered by seeing them together. A design
 * system reviewed component-by-component always converges on a set of things
 * that are individually defensible and collectively incoherent.
 *
 * It renders in the real shell, on the real page ground, in the real theme,
 * rather than on a white sheet in isolation — a swatch on white tells you
 * nothing about how a badge sits on a panel on the canvas.
 */
export default function ComponentsPage() {
  return (
    <DashboardPage
      title="Components"
      description="Every primitive, together, in the current theme."
      showPeriod={false}
      note={NOTE}
      noteIcon={<Palette />}
      noteTitle="Why one page"
      scroll="outer"
    >
      <GalleryClient />
    </DashboardPage>
  );
}
