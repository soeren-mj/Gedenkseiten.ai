'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useMemorial } from '@/contexts/MemorialContext';
import { Button } from '@/components/ui/Button';

/**
 * Kondolenzbuch Management Page
 *
 * Empty state page for the condolence book feature.
 * Memorial data is provided by MemorialContext (fetched in layout).
 */
export default function KondolenzbuchPage() {
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
        <h1 className="text-webapp-subsection text-primary">
          Digitales Kondolenzbuch
        </h1>
        <p className="text-body-m text-secondary">
          Erstelle eine Möglichkeit für Gäste ihre Anteilnahme und persönlichen Worte zu verewigen. Jeder Nutzer kann sich einmal im Kondolenzbuch verewigen.
        </p>
      </div>

      {/* Main Panel - Empty State */}
      <div className="px-4">
        <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-interactive-default rounded-xs bg-primary min-h-[400px]">
          <div className="flex flex-col items-center gap-2 text-center max-w-sm">
            <p className="text-body-l text-primary font-medium">
              Das Kondolenzbuch ist noch leer.
            </p>
            <p className="text-body-m text-secondary">
              Erstelle eine Titelseite und verfasse ggf. einen ersten Eintrag
            </p>
          </div>
          <Button variant="primary" disabled>
            Titelseite erstellen
          </Button>
        </div>
      </div>
    </div>
  );
}
