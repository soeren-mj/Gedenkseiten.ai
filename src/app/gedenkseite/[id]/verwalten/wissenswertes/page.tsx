'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto flex flex-col gap-3 pt-4 mb-10">
      {/* Back Link */}
      <Link
        href={`/gedenkseite/${memorial.id}/verwalten`}
        className="flex items-center gap-1 text-body-s text-tertiary hover:text-primary transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Zurück zur Übersicht</span>
      </Link>

      {/* Page Header */}
      <div className="w-full p-5 pb-7 flex flex-col gap-2">
        <Badge variant="empfehlung" className="w-fit">
          Empfehlung
        </Badge>
        <h1 className="text-webapp-subsection text-primary">
          Wissenswertes hinzufügen
        </h1>
        <p className="text-body-m text-secondary">
          Was hat {memorial.first_name} besonders gemacht? Teile kleine Fakten, Errungenschaften oder Eigenheiten.
        </p>
      </div>

      {/* Main Panel */}
      <div className="px-4">
        <div className="flex flex-col gap-8 p-4 border border-card rounded-xs bg-primary">
          {/* Wissenswertes Manager */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-webapp-body text-bw">Fakten</h2>
              <div className="border-b border-main"></div>
            </div>
            <WissenswertesManager
              memorialId={memorial.id}
              firstName={memorial.first_name}
            />
          </div>
        </div>
         {/* Examples Section */}
         <div className="flex flex-col gap-3 mt-8 p-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-webapp-body text-bw">Beispiele zur Inspiration</h2>
              <div className="border-b border-main"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PILLS.map((example, index) => (
                <div
                  key={index}
                  className="
                    flex items-center gap-2
                    px-2 py-1
                    bg-secondary border border-main rounded-md
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
    </div>
  );
}
