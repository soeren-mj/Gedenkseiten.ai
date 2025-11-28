'use client';

import { useState, useEffect } from 'react';
import type { Wissenswertes } from '@/lib/supabase';

interface WissenswertesSectionProps {
  memorialId: string;
}

/**
 * WissenswertesSection Component
 *
 * Displays wissenswertes entries on the public memorial page.
 * Features:
 * - Fetches entries from API
 * - Pills with gradient text on hover
 * - Desktop: Pills in flex-wrap layout
 * - Mobile: Full-width pills
 */
export function WissenswertesSection({ memorialId }: WissenswertesSectionProps) {
  const [items, setItems] = useState<Wissenswertes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`/api/memorials/${memorialId}/wissenswertes`);
        if (response.ok) {
          const result = await response.json();
          setItems(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching wissenswertes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [memorialId]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] p-6 shadow border border-main">
        <div className="animate-pulse">
          <div className="h-6 bg-bw-opacity-40 rounded w-40 mb-4"></div>
          <div className="flex flex-wrap gap-2">
            <div className="h-10 bg-bw-opacity-40 rounded-xxs w-32"></div>
            <div className="h-10 bg-bw-opacity-40 rounded-xxs w-48"></div>
            <div className="h-10 bg-bw-opacity-40 rounded-xxs w-40"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-[20px] p-6 shadow border border-main">
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
              hover:border-hover
              bg-hover:text-gradient-warm-sunset
            "
          >
            <span className="flex-shrink-0 text-body-s">{item.emoji}</span>
            <span className="
              text-body-s-semibold text-primary text-left
              group-hover:text-gradient-night-is-coming
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
