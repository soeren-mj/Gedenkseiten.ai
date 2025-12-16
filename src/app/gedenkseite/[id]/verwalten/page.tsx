'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemorial } from '@/contexts/MemorialContext';
import { useToast } from '@/contexts/ToastContext';
import { formatFullName } from '@/lib/utils/nameFormatter';
import { createClient } from '@/lib/supabase/client-legacy';
import type { ReactionType } from '@/lib/supabase';

// Components
import { UserMemorialCard } from '@/components/memorial/UserMemorialCard';
import { MemorialToDoCard } from '@/components/memorial/MemorialToDoCard';
import { HubCard } from '@/components/memorial/HubCard';

// Icons
import ArrowUpRightIcon from '@/components/icons/ArrowUpRightIcon';
import WissenswertesIcon from '@/components/icons/WissenswertesIcon';
import KondolenzbuchIcon from '@/components/icons/KondolenzbuchIcon';
import TermineIcon from '@/components/icons/TermineIcon';
import VisuelleErinnerungenIcon from '@/components/icons/VisuelleErinnerungenIcon';

type ReactionCounts = { [key in ReactionType]: number };

/**
 * Memorial Management Overview Page
 *
 * Dashboard for managing a memorial page with:
 * - UserMemorialCard (left) - Avatar, name, dates, privacy, reactions
 * - MemorialToDoCard (middle) - Dynamic checklist items
 * - Hub-Cards grid - Quick access to content sections
 * - Settings Overlay - Memorial settings modal
 * - Welcome Toast - First-time user greeting
 */
export default function MemorialManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { memorial } = useMemorial();
  const { showSuccess } = useToast();

  // State
  const [wissenswertesCount, setWissenswertesCount] = useState(0);
  const [kondolenzbuchCount, setKondolenzbuchCount] = useState(0);
  const [reactions, setReactions] = useState<ReactionCounts | null>(null);
  const welcomeShownRef = useRef(false);

  const displayName = formatFullName(memorial);

  // Fetch counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch wissenswertes count
      const { count: wissenswertesTotal } = await supabase
        .from('wissenswertes')
        .select('*', { count: 'exact', head: true })
        .eq('memorial_id', memorial.id);

      setWissenswertesCount(wissenswertesTotal || 0);

      // Fetch kondolenzbuch count (if table exists)
      // TODO: Implement when kondolenzbuch table is created
      setKondolenzbuchCount(0);

      // Fetch reactions
      if (session?.access_token) {
        try {
          const response = await fetch(`/api/memorials/${memorial.id}/reactions`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setReactions(data.data.counts);
            }
          }
        } catch (error) {
          console.error('Error fetching reactions:', error);
        }
      }
    };

    fetchCounts();
  }, [memorial.id]);

  // Show welcome toast on first visit
  useEffect(() => {
    const showWelcome = searchParams.get('welcome') === 'true';

    // Use ref for synchronous check to prevent double-firing in Strict Mode
    if (showWelcome && !welcomeShownRef.current) {
      welcomeShownRef.current = true;

      // Show success toast
      showSuccess(
        `Glückwunsch, deine Gedenkseite ist nun erstellt.`,
        `Füge weitere Inhalte hinzu und personalisiere die Gedenkseite von ${memorial.first_name}. Lade gern Verwandte und Bekannte ein, mit Gedenkbotschaften wird die Seite zu einer dauerhaften Erinnerung.`
      );

      // Clean URL by removing welcome parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('welcome');
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, showSuccess, memorial.first_name, router]);

  // Calculate total reactions count
  const getTotalReactions = useCallback(() => {
    if (!reactions) return 0;
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  }, [reactions]);

  // Content state checks
  const hasSpruchOrNachruf = !!(memorial.memorial_quote || memorial.obituary);
  const hasWissenswertes = wissenswertesCount > 0;
  const hasKondolenzbuch = kondolenzbuchCount > 0;
  const hasTermine = false; // TODO: Implement when termine table is created
  const hasReactions = getTotalReactions() > 0;

  return (
    <div className="flex flex-col gap-2 mb-10">
      {/* Headline Section */}
      <div className="flex flex-col gap-2 py-10 text-center items-center">
        <h1 className="text-webapp-section text-primary">
          Willkommen in deiner Gedenkseiten-Übersicht
        </h1>
        <p className="text-body-m text-secondary max-w-[685px]">
          Hier findest du alle Möglichkeiten die Gedenkseite von <span className="font-semibold">{displayName}</span> zu personalisieren und zu verwalten.
        </p>
      </div>

      {/* Hub Container */}
      <div className="flex flex-col gap-8 pt-4 items-center overflow-visible">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl w-full overflow-visible">
        {/* a) UserMemorialCard - Outside grid, left side */}
        <div className="overflow-visible">
          <UserMemorialCard
            memorial={memorial}
            reactions={reactions || undefined}
          />
        </div>

        {/* b) Grid Container - Right side */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* MemorialToDoCard - spans 2 columns */}
            <MemorialToDoCard
              memorial={memorial}
              wissenswertesCount={wissenswertesCount}
              kondolenzbuchCount={kondolenzbuchCount}
              className="md:col-span-2"
            />

            {/* Seite ansehen - Always visible */}
            <HubCard
              icon={<ArrowUpRightIcon className="w-12 h-12" />}
              iconAlign="end"
              title="Seite ansehen"
              description="Hier gelangst du zur Gedenkseite wie jeder Besucher sie sieht."
              onClick={() => window.open(`/gedenkseite/${memorial.id}`, '_blank')}
            />

            {/* Neue Reaktionen - Only if reactions exist */}
            {hasReactions && (
              <HubCard
                textIcon={String(getTotalReactions())}
                title="Neue Reaktionen"
                description="Besucher haben auf die Gedenkseite reagiert."
                href={`/gedenkseite/${memorial.id}/verwalten/reaktionen`}
              />
            )}

            {/* Spruch und Nachruf - Only if content exists */}
            {hasSpruchOrNachruf && (
              <HubCard
                textIcon="ABC"
                title="Spruch und Nachruf"
                description="Bearbeite den Gedenkspruch und Nachruf."
                href={`/gedenkseite/${memorial.id}/verwalten/spruch-nachruf`}
              />
            )}

            {/* Wissenswertes - Only if content exists */}
            {hasWissenswertes && (
              <HubCard
                icon={<WissenswertesIcon size={48} />}
                title="Wissenswertes"
                description={`${wissenswertesCount} Einträge über ${memorial.first_name}`}
                href={`/gedenkseite/${memorial.id}/verwalten/wissenswertes`}
              />
            )}

            {/* Kondolenzbuch - Only if content exists */}
            {hasKondolenzbuch && (
              <HubCard
                icon={<KondolenzbuchIcon size={48} />}
                title="Kondolenzbuch"
                description={`${kondolenzbuchCount} Einträge im Kondolenzbuch`}
                href={`/gedenkseite/${memorial.id}/verwalten/kondolenzbuch`}
              />
            )}

            {/* Termine - Only if content exists */}
            {hasTermine && (
              <HubCard
                icon={<TermineIcon size={48} />}
                title="Termine"
                description="Verwalte Gedenktermine und Jahrestage."
                href={`/gedenkseite/${memorial.id}/verwalten/termine`}
              />
            )}

            {/* Visuelle Erinnerungen - Coming Soon */}
            <HubCard
              icon={<VisuelleErinnerungenIcon size={48} />}
              title="Visuelle Erinnerungen"
              description="Lade Fotos und Videos hoch, um Erinnerungen zu teilen."
              disabled
              badge="inPlanung"
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
