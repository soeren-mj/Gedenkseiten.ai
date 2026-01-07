import type { Wissenswertes } from '@/lib/supabase';

interface WissenswertesSectionProps {
  /** Server-side loaded items - when provided, skips client-side fetch */
  items: Wissenswertes[];
}

/**
 * WissenswertesSection Component
 *
 * Displays wissenswertes entries on the public memorial page.
 * Features:
 * - Receives pre-loaded items from server component
 * - Pills with gradient text on hover
 * - Desktop: Pills in flex-wrap layout
 * - Mobile: Full-width pills
 */
export function WissenswertesSection({ items }: WissenswertesSectionProps) {
  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl p-1">
      {/* Section Header */}
      <h3 className="text-primary mb-4">
        Wissenswertes
      </h3>

      {/* Pills Container */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="
              group
              flex items-center gap-1
              px-2 py-1
              bg-primary border border-main rounded-md
              w-full sm:w-auto
              cursor-default
              transition-all duration-200
              hover:bg-secondary
            "
          >
            <span className="flex-shrink-0 text-body-s">{item.emoji}</span>
            <span className="
              text-body-s-semibold text-primary text-left
              transition-all duration-200
            ">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
