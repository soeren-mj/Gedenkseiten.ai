'use client';

import ChecklistItem from '@/components/dashboard/ChecklistItem';
import type { Memorial } from '@/lib/supabase';

interface MemorialToDoCardProps {
  memorial: Memorial;
  wissenswertesCount: number;
  kondolenzbuchCount: number;
  className?: string;
}

interface ToDoItem {
  id: string;
  title: string;
  description: string;
  badge?: 'empfehlung' | 'premium';
  href: string;
  isCompleted: boolean;
}

/**
 * MemorialToDoCard Component
 *
 * Shows checklist items for memorial personalization.
 * Items disappear when their content is filled.
 *
 * Items:
 * 1. Spruch und Nachruf schreiben [Empfehlung]
 * 2. Wissenswertes über {NAME} [Empfehlung]
 * 3. Wähle deinen bevorzugten Look (Avatar)
 * 4. Erhalte Anteilnahme mit digitalen Kondolenzen [Empfehlung]
 */
export function MemorialToDoCard({
  memorial,
  wissenswertesCount,
  kondolenzbuchCount,
  className = '',
}: MemorialToDoCardProps) {
  const firstName = memorial.first_name;
  const memorialId = memorial.id;

  // Define todo items with their completion conditions
  const todoItems: ToDoItem[] = [
    {
      id: 'spruch-nachruf',
      title: 'Spruch und Nachruf schreiben',
      description: `Zeige deine Anteilnahme: nimm persönliche Worte und zeige damit was für ein Mensch ${firstName} gewesen ist.`,
      badge: 'empfehlung',
      href: `/gedenkseite/${memorialId}/verwalten/spruch-nachruf`,
      isCompleted: !!(memorial.memorial_quote || memorial.obituary),
    },
    {
      id: 'wissenswertes',
      title: `Wissenswertes über ${firstName}`,
      description: `Was hat ${firstName} besonders gemacht? Teile kleine Fakten, Errungenschaften oder Eigenheiten.`,
      badge: 'empfehlung',
      href: `/gedenkseite/${memorialId}/verwalten/wissenswertes`,
      isCompleted: wissenswertesCount > 0,
    },
    {
      id: 'darstellung',
      title: 'Wähle deinen bevorzugten Look',
      description: `In welchem Erscheinungsbild soll die Gedenkseite von ${firstName} für Besucher sein?`,
      href: `/gedenkseite/${memorialId}/verwalten/darstellung`,
      isCompleted: memorial.avatar_type !== 'initials',
    },
    {
      id: 'kondolenzbuch',
      title: 'Erhalte Anteilnahme mit digitalen Kondolenzen',
      description: 'Erstelle eine Möglichkeit Anteilnahme und persönliche Widmungen zu erhalten',
      badge: 'empfehlung',
      href: `/gedenkseite/${memorialId}/verwalten/kondolenzbuch`,
      isCompleted: kondolenzbuchCount > 0,
    },
  ];

  // Filter out completed items
  const visibleItems = todoItems.filter((item) => !item.isCompleted);
  const openItemsCount = visibleItems.length;

  // Don't render if all items are complete
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    // Outer container (frame effect like MemorialCard/HubCard)
    <div className={`bg-bw-opacity-40 rounded-md shadow-card p-1 ${className}`}>
      {/* Inner container */}
      <div className="w-full h-full bg-light-dark-mode rounded-sm">
        {/* Header */}
        <div className="flex items-center gap-4 p-4">
          {/* Counter with textIcon styling */}
          <span className="w-16 h-16 font-satoshi font-regular text-[3rem] leading-none text-link-default flex items-center">
            {openItemsCount}
          </span>

          {/* Title & Description */}
          <div>
            <h3 className="text-webapp-body text-primary">
              Persönliche Nachrichten
            </h3>
            <p className="text-body-m text-secondary">
              Du kannst noch Einstellungen erkunden
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="flex flex-col gap-2 p-2 border-t border-main">
          {visibleItems.map((item) => (
            <ChecklistItem
              key={item.id}
              title={item.title}
              description={item.description}
              badge={item.badge}
              href={item.href}
              checked={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
