'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemorial } from '@/contexts/MemorialContext';
import { formatFullName } from '@/lib/utils/nameFormatter';
import { ContentOption } from '@/components/memorial/ContentOption';
import { DashboardCard } from '@/components/cards/DashboardCard';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import ArrowUpRightIcon from '@/components/icons/ArrowUpRightIcon';
import { Heart } from 'lucide-react';

/**
 * Memorial Management Page
 *
 * Dashboard for managing a memorial page with sidebar navigation.
 * Memorial data is provided by MemorialContext (fetched in layout).
 * Shows welcome banner when redirected from creation (welcome=true query param).
 */
export default function MemorialManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { memorial } = useMemorial(); // Get memorial from context (already fetched in layout)

  const showWelcome = searchParams.get('welcome') === 'true';
  const displayName = formatFullName(memorial);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Welcome Banner (shown only after initial creation) */}
      {showWelcome && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <h2 className="text-section-h2 text-green-800 dark:text-green-200 mb-2">
            Gedenkseite erfolgreich erstellt! 🎉
          </h2>
          <p className="text-body-m text-green-700 dark:text-green-300">
            Deine Gedenkseite für {displayName} ist jetzt online.
          </p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-webapp-title text-primary mb-2">
          Übersicht für {displayName}
        </h1>
        <p className="text-body-m text-secondary">
        Willkommen im Dashboard! Hier kannst du deine Inhalte verwalten und deine Seite weiter verbessern.
        </p>
      </div>

      {/* Status Cards */}
      <div className="flex gap-6 my-12">
        <DashboardCard
          headline="Profil-Fortschritt"
          description="Du kannst noch Inhalte nutzen und deine Seite gestalten."
          icon={
            <InitialsAvatar
              name={`${memorial.first_name} ${memorial.last_name || ''}`}
              imageUrl={memorial.avatar_url}
              avatarType={memorial.avatar_type}
              memorialType={memorial.type}
              size="xl"
            />
          }
          clickable={false}
        />

        <DashboardCard
          headline="Besucher"
          description="Anzahl wie oft deine Seite aufgerufen wurde"
          icon={
            <div className="text-[2rem] sm:text-[3rem] h-10 sm:h-16 font-satoshi font-semibold text-accent-red">
              {memorial.view_count || 0}
            </div>
          }
          clickable={false}
        />

        <DashboardCard
          headline="Seite ansehen"
          description="Hier gelangst du zur Gedenkseite wie jeder Besucher sie sieht."
          icon={<ArrowUpRightIcon className="w-10 h-10 sm:w-16 sm:h-16 text-interactive-link-default" color="currentColor" />}
          onClick={() => window.open(`/gedenkseite/${memorial.id}`, '_blank')}
          clickable={true}
        />

        <DashboardCard
          headline="Reaktionen"
          description="Alle Reaktionen der Besucher auf einen Blick."
          icon={<Heart className="w-10 h-10 sm:w-16 sm:h-16 text-accent-red" />}
          onClick={() => router.push(`/gedenkseite/${memorial.id}/verwalten/reaktionen`)}
          clickable={true}
        />
      </div>

      {/* Content Options */}
      <div className="w-full mx-auto flex flex-col gap-4">
        {/* Free Content Section */}
        <div className="flex flex-col gap-1 mt-4">
          <h2 className="text-webapp-body text-bw">Weitere Inhalte für deine Gedenkseite</h2>
          <div className="border-b border-main"></div>
        </div>

        <div className="flex flex-col gap-3">
          <ContentOption
            title="Spruch"
            description="Als dezentes Element ist der Spruch die erste persönliche Note (max. 160 Zeichen). Für Besucher ist der Spruch meinst einfacher zu lesen als der Nachruf."
            badge="EMPFEHLUNG"
            buttonText="Bald verfügbar"
            disabled
          />
          <ContentOption
            title="Nachruf"
            description="Mit dem Nachruf hast du die Möglichkeit eine ausführliche Würdigung des Lebens und der Leistungen zu hinterlassen."
            badge="EMPFEHLUNG"
            buttonText="Bald verfügbar"
            disabled
          />
          <ContentOption
            title="Wissenswertes"
            description="Du kannst hier interessante Details zum Leben der Person festhalten wie zum Beispiel besondere Leistungen oder Hobbys."
            badge="EMPFEHLUNG"
            buttonText="Bald verfügbar"
            disabled
          />
          <ContentOption
            title="Kondolenzbuch"
            description="Erstelle eine Möglichkeit für Gäste ihre Anteilnahme und persönlichen Worte zu verewigen."
            badge="EMPFEHLUNG"
            buttonText="Bald verfügbar"
            disabled
          />
          <ContentOption
            title="Termine"
            description="Jahrestage, Beerdigung, Gedenkfeiern"
            buttonText="Bald verfügbar"
            disabled
          />
        </div>

        {/* Premium Content Section */}
        <div className="flex flex-col gap-1 mt-4">
          <h2 className="text-webapp-body text-bw">Premium Inhalte</h2>
          <div className="border-b border-main"></div>
        </div>

        <div className="flex flex-col gap-3">
          <ContentOption
            title="Erinnerungen"
            description="Erinnerungen sind Foto und Video Rückblicke die du erstellen kannst."
            buttonText="Bald verfügbar"
            disabled
            premium
          />
        </div>
      </div>
    </div>
  );
}
