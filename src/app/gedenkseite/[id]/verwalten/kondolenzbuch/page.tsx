'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useMemorial } from '@/contexts/MemorialContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { CondolenceBook, CondolenceEntryWithDetails } from '@/lib/supabase';
import { CoverPreview } from '@/components/kondolenzbuch/CoverPreview';
import { EntryCard } from '@/components/kondolenzbuch/EntryCard';

/**
 * Kondolenzbuch Management Page
 *
 * Shows empty state if no condolence book exists,
 * otherwise shows management view with cover preview and entries list.
 */
export default function KondolenzbuchPage() {
  const { memorial } = useMemorial();
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [condolenceBook, setCondolenceBook] = useState<CondolenceBook | null>(null);
  const [entries, setEntries] = useState<CondolenceEntryWithDetails[]>([]);
  const [newEntriesCount, setNewEntriesCount] = useState(0);

  // Check if current user has an entry
  const userEntry = entries.find((entry) => entry.user_id === user?.id);

  // Fetch condolence book and entries
  useEffect(() => {
    async function fetchCondolenceBook() {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      // Fetch condolence book for this memorial
      const { data: book, error: bookError } = await db
        .from('condolence_books')
        .select('*')
        .eq('memorial_id', memorial.id)
        .single();

      if (bookError && bookError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (expected for empty state)
        console.error('Error fetching condolence book:', bookError);
      }

      if (book) {
        setCondolenceBook(book);

        // Fetch entries with images (profile data fetched separately)
        const { data: entriesData, error: entriesError } = await db
          .from('condolence_entries')
          .select(`
            *,
            images:condolence_entry_images(*)
          `)
          .eq('book_id', book.id)
          .order('created_at', { ascending: false });

        if (entriesError) {
          console.error('Error fetching entries:', entriesError);
        } else if (entriesData) {
          // Fetch user data for each unique user
          const userIds = [...new Set(entriesData.map((e: { user_id: string }) => e.user_id))];
          const { data: usersData } = await db
            .from('users')
            .select('id, name, avatar_url')
            .in('id', userIds);

          // Create a map of user_id -> user data
          const usersMap = new Map(
            (usersData || []).map((u: { id: string; name: string | null; avatar_url: string | null }) => [u.id, { name: u.name, avatar_url: u.avatar_url }])
          );

          // Merge user data into entries
          const entriesWithUsers = entriesData.map((entry: { user_id: string }) => ({
            ...entry,
            user: usersMap.get(entry.user_id) || null,
          }));

          setEntries(entriesWithUsers as CondolenceEntryWithDetails[]);
          // Count unread entries
          const unread = entriesData.filter((e: { is_read_by_admin: boolean }) => !e.is_read_by_admin).length;
          setNewEntriesCount(unread);
        }
      }

      setLoading(false);
    }

    fetchCondolenceBook();
  }, [memorial.id]);

  const handleCreateCover = () => {
    router.push(`/gedenkseite/${memorial.id}/kondolenzbuch/erstellen/deckblatt`);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-3 pt-4 mb-10">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-secondary rounded mb-4"></div>
          <div className="h-8 w-64 bg-secondary rounded mb-2"></div>
          <div className="h-4 w-full bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

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
      <div className="w-full p-5 flex flex-col gap-2">
        <h1 className="text-webapp-subsection text-primary">
          Digitales Kondolenzbuch
        </h1>
        <p className="text-body-m text-secondary">
          {condolenceBook
            ? 'Hier kannst du die Einträge von anderen Personen verwalten, deinen eigenen Eintrag ändern oder weitere Personen einladen.'
            : 'Erstelle eine Möglichkeit für Gäste ihre Anteilnahme und persönlichen Worte zu verewigen. Jeder Nutzer kann sich einmal im Kondolenzbuch verewigen.'}
        </p>
      </div>

      {/* Conditional: Empty State or Management View */}
      {!condolenceBook ? (
        // Empty State
        <div className="px-4">
          <div className="aspect-[2/3] max-w-[300px] mx-auto flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-interactive-default rounded-md bg-primary">
            <div className="flex flex-col items-center gap-2 text-center max-w-sm">
              <p className="text-body-l text-primary font-medium">
                Das Kondolenzbuch ist noch leer.
              </p>
              <p className="text-body-m text-secondary">
                Erstelle eine Titelseite und verfasse ggf. einen ersten Eintrag
              </p>
            </div>
            <Button variant="primary" onClick={handleCreateCover}>
              Titelseite erstellen
            </Button>
          </div>
        </div>
      ) : (
        // Management View
        <div className="px-4 flex flex-col gap-6">
          {/* Action Buttons */}
          <div className="flex gap-3 pb-2">
            <Button
              variant={userEntry ? 'tertiary' : 'primary'}
              size="sm"
              rightIcon={<Pencil className="w-4 h-4" />}
              onClick={() =>
                router.push(
                  userEntry
                    ? `/gedenkseite/${memorial.id}/kondolenzbuch/erstellen/eintrag?edit=${userEntry.id}`
                    : `/gedenkseite/${memorial.id}/kondolenzbuch/erstellen/eintrag`
                )
              }
            >
              {userEntry ? 'Eintrag bearbeiten' : 'Eintrag schreiben'}
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Personen einladen
            </Button>
          </div>

          {/* Entries Counter */}
          <div className="flex items-center gap-2">
            <span className="text-body-m text-primary font-medium">
              {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}
            </span>
            {newEntriesCount > 0 && (
              <span className="flex items-center gap-1 text-body-s text-interactive-primary-default">
                <span className="w-2 h-2 rounded-full bg-interactive-primary-default"></span>
                {newEntriesCount}{' '}
                {newEntriesCount === 1 ? 'neuer Eintrag' : 'neue Einträge'}
              </span>
            )}
          </div>

          {/* Cover Preview + Entries Grid */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cover Preview (Left) */}
            <div className="w-full max-w-[300px] flex-shrink-0">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/gedenkseite/${memorial.id}/kondolenzbuch/erstellen/deckblatt`
                  )
                }
                className="w-full group relative"
              >
                <CoverPreview
                  coverType={condolenceBook.cover_type}
                  coverValue={condolenceBook.cover_value}
                  title={condolenceBook.cover_title}
                  textColor={condolenceBook.text_color}
                  showProfile={condolenceBook.show_profile}
                  memorialData={{
                    firstName: memorial.first_name,
                    lastName: memorial.last_name,
                    avatarUrl: memorial.avatar_url,
                    avatarType: memorial.avatar_type,
                  }}
                  className="transition-transform group-hover:scale-[1.02]"
                />
                {/* Edit Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white text-black px-3 py-1.5 rounded-sm text-body-s font-medium shadow-lg">
                    Bearbeiten
                  </span>
                </div>
              </button>
            </div>

            {/* Entries Grid (Right) */}
            <div className="lg:w-2/3 flex flex-col gap-4">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-interactive-default rounded-xs bg-primary min-h-[200px]">
                  <p className="text-body-m text-secondary text-center">
                    Noch keine Einträge vorhanden.
                  </p>
                  <p className="text-body-s text-tertiary text-center mt-1">
                    Verfasse den ersten Eintrag oder lade andere ein.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      isOwn={entry.user_id === user?.id}
                      isAdmin={
                        memorial.creator_id === user?.id ||
                        memorial.user_role === 'administrator'
                      }
                      isNew={!entry.is_read_by_admin}
                      onEdit={
                        entry.user_id === user?.id
                          ? () =>
                              router.push(
                                `/gedenkseite/${memorial.id}/kondolenzbuch/erstellen/eintrag?edit=${entry.id}`
                              )
                          : undefined
                      }
                      onDelete={async () => {
                        if (
                          !confirm(
                            'Möchtest du diesen Eintrag wirklich löschen?'
                          )
                        )
                          return;

                        try {
                          const supabase = createClient();
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const { error } = await (supabase as any)
                            .from('condolence_entries')
                            .delete()
                            .eq('id', entry.id);

                          if (error) throw error;

                          setEntries((prev) =>
                            prev.filter((e) => e.id !== entry.id)
                          );
                          showToast('success', 'Gelöscht', 'Eintrag gelöscht');
                        } catch (error) {
                          console.error('Error deleting entry:', error);
                          showToast('error', 'Fehler', 'Fehler beim Löschen');
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
