'use client';

import { useMemorial } from '@/contexts/MemorialContext';
import { Badge } from '@/components/ui/Badge';
import { WissenswertesManager } from '@/components/memorial/WissenswertesManager';

/**
 * Example pills for inspiration
 */
const EXAMPLE_PILLS = [
  { emoji: '👵', text: 'Oma von 7 Enkeln' },
  { emoji: '⚽', text: '3-maliger Oberliga Meister mit Tottenham Dorfheim e.V. in Bayern' },
  { emoji: '🧑‍🌾', text: 'Gärtnerin aus Leidenschaft' },
  { emoji: '🎓', text: '40 Jahre Lehrerin in der Grundschule' },
];

/**
 * Wissenswertes Management Page
 *
 * Allows users to add, edit, delete, and reorder notable facts
 * about the deceased person.
 */
export default function WissenswertesPage() {
  const { memorial } = useMemorial();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Page Header with Badge */}
      <div className="mb-8">
        <Badge variant="empfehlung" className="mb-3">Empfehlung</Badge>
        <h1 className="text-webapp-subsection text-primary mb-2">
          Wissenswertes hinzufügen
        </h1>
        <p className="text-body-l text-secondary">
          Was hat {memorial.first_name} besonders gemacht? Teile kleine Fakten, Errungenschaften oder Eigenheiten.
        </p>
      </div>

      {/* Wissenswertes Manager */}
      <div className="">
        <WissenswertesManager
          memorialId={memorial.id}
          firstName={memorial.first_name}
          lastName={memorial.last_name}
        />
      </div>

      {/* Examples Section */}
      <div>
        <h3 className="text-webapp-group text-secondary mb-3 border-t border-main pt-6">Beispiele:</h3>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PILLS.map((example, index) => (
            <div
              key={index}
              className="
                flex items-center gap-2
                px-2 py-1
                bg-primary border border-main rounded-md
                text-body-s-semibold text-primary
              "
            >
              <span>{example.emoji}</span>
              <span>{example.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
