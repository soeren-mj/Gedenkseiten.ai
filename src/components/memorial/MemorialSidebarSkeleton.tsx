import { Skeleton } from '@/components/ui/Skeleton';

/**
 * MemorialSidebarSkeleton - Loading placeholder for Memorial Sidebar Profile
 *
 * Displays a skeleton loader matching the layout of MemorialSidebarProfile.
 * Used when memorial data is being fetched during navigation transitions.
 *
 * Layout:
 * - Circular avatar skeleton (32×32)
 * - Text skeleton for name
 * - Rectangular skeleton for privacy badge
 *
 * This component is shown in the Sidebar when:
 * - Navigating to memorial management page
 * - Memorial data hasn't loaded yet
 * - Prevents flickering/empty state during transitions
 */
export function MemorialSidebarSkeleton() {
  return (
    <div className="flex items-center gap-3 p-1 rounded-lg">
      {/* Avatar Skeleton - Circular, matches InitialsAvatar size="sm" (32×32) */}
      <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />

      {/* Name and Badge Container */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {/* Name Text Skeleton - ~96px width for typical names */}
        <Skeleton variant="text" className="h-4 w-24" />

        {/* Privacy Badge Skeleton - matches typical badge size */}
        <Skeleton variant="rectangular" className="h-5 w-16 rounded-xs" />
      </div>
    </div>
  );
}
