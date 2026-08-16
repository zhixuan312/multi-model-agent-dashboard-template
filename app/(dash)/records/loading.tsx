import { PageFrame } from '@/components/ui';
import { SkeletonPanel } from '@/components/ui/skeleton';

/**
 * Records overrides the group skeleton: this page is one full-height table with
 * no status row and no rail, so the shared metric-row-plus-two-panels shape
 * would resolve into something a different size and jump the layout on arrival.
 * A skeleton that does not match what is coming is worse than no skeleton.
 */
export default function RecordsLoading() {
  return (
    <PageFrame title="Records" width="full" fill>
      <div className="flex h-full min-h-0 flex-1 flex-col" role="status" aria-label="Loading">
        <SkeletonPanel lines={12} className="min-h-0 flex-1" />
      </div>
    </PageFrame>
  );
}
