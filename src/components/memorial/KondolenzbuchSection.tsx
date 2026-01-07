'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CoverPreview } from '@/components/kondolenzbuch/CoverPreview';
import { EntryCard } from '@/components/kondolenzbuch/EntryCard';
import { CondolenceEntryModal } from '@/components/kondolenzbuch/CondolenceEntryModal';
import Button from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';
import type { CondolenceBook, CondolenceEntryWithDetails, CoverType, TextColor } from '@/lib/supabase';

interface KondolenzbuchSectionProps {
  memorialId: string;
  memorialData: {
    firstName: string;
    lastName?: string | null;
    avatarUrl?: string | null;
    avatarType?: 'initials' | 'image';
  };
  isAuthenticated: boolean;
  currentUserId?: string;
  userName?: string;
  userAvatar?: string | null;
}

interface BookResponse {
  success: boolean;
  data: CondolenceBook | null;
  entriesCount: number;
  newEntriesCount: number;
  error?: string;
}

interface EntriesResponse {
  success: boolean;
  data: CondolenceEntryWithDetails[];
  error?: string;
}

/**
 * Kondolenzbuch Section for Public Memorial Page
 *
 * Displays:
 * - Cover preview (if book exists)
 * - List of condolence entries (visible ones only for non-authors)
 * - Modal for creating/editing entries
 */
export function KondolenzbuchSection({
  memorialId,
  memorialData,
  isAuthenticated,
  currentUserId,
  userName,
  userAvatar,
}: KondolenzbuchSectionProps) {
  const { showToast } = useToast();
  const supabase = createClient();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState<CondolenceBook | null>(null);
  const [entries, setEntries] = useState<CondolenceEntryWithDetails[]>([]);
  const [hasUserEntry, setHasUserEntry] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CondolenceEntryWithDetails | null>(null);

  // Fetch book and entries
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch book (public endpoint - no auth required)
      const bookRes = await fetch(`/api/memorials/${memorialId}/condolence-book`);
      const bookData: BookResponse = await bookRes.json();

      if (!bookData.success || !bookData.data) {
        setBook(null);
        setEntries([]);
        setIsLoading(false);
        return;
      }

      setBook(bookData.data);

      // Fetch entries (public endpoint - no auth required)
      const entriesRes = await fetch(`/api/memorials/${memorialId}/condolence-book/entries`);
      const entriesData: EntriesResponse = await entriesRes.json();

      if (entriesData.success && entriesData.data) {
        // Filter out hidden entries (unless it's the user's own entry)
        const visibleEntries = entriesData.data.filter(
          (entry) => !entry.is_hidden || entry.user_id === currentUserId
        );
        setEntries(visibleEntries);

        // Check if current user already has an entry
        if (currentUserId) {
          const userEntry = entriesData.data.find((e) => e.user_id === currentUserId);
          setHasUserEntry(!!userEntry);
        }
      }
    } catch (error) {
      console.error('Error fetching kondolenzbuch:', error);
    } finally {
      setIsLoading(false);
    }
  }, [memorialId, currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle opening modal for new entry
  const handleOpenCreateModal = () => {
    setEditingEntry(null);
    setShowModal(true);
  };

  // Handle opening modal for editing
  const handleOpenEditModal = (entry: CondolenceEntryWithDetails) => {
    setEditingEntry(entry);
    setShowModal(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEntry(null);
  };

  // Handle modal success (refresh data)
  const handleModalSuccess = () => {
    fetchData();
  };

  // Handle toggle hide for own entry
  const handleToggleHide = async (entry: CondolenceEntryWithDetails) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast('error', 'Fehler', 'Du musst angemeldet sein.');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('condolence_entries')
        .update({ is_hidden: !entry.is_hidden })
        .eq('id', entry.id);

      if (error) throw error;

      // Update local state
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id ? { ...e, is_hidden: !e.is_hidden } : e
        )
      );

      showToast(
        'success',
        entry.is_hidden ? 'Eingeblendet' : 'Verborgen',
        entry.is_hidden
          ? 'Dein Eintrag ist wieder sichtbar'
          : 'Dein Eintrag ist nun verborgen'
      );
    } catch (error) {
      console.error('Error toggling entry visibility:', error);
      showToast('error', 'Fehler', 'Fehler beim Ändern der Sichtbarkeit');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-bw-opacity-40 p-5">
        <h3 className="text-primary mb-6">Kondolenzbuch</h3>
        <div className="flex justify-center">
          <Skeleton className="w-[340px] h-[510px] rounded-md" />
        </div>
      </section>
    );
  }

  // No book exists
  if (!book) {
    return null;
  }

  return (
    <section className="bg-bw-opacity-40 p-5">
      {/* Section Header + Counter + Button */}
      <div className="flex justify-between items-end mb-6">
        {/* Links: Titel + Counter */}
        <div>
          <h3 className="text-primary">Kondolenzbuch</h3>
          <p className="text-secondary text-body-s">
            {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}
          </p>
        </div>

        {/* Rechts: Button (sichtbar wenn nicht eingeloggt ODER eingeloggt ohne Eintrag) */}
        {(!isAuthenticated || !hasUserEntry) && (
          <Button variant="primary" onClick={handleOpenCreateModal}>
            Kondolenz hinterlassen
          </Button>
        )}
      </div>

      {/* Horizontaler Scroll-Container für Cover + Entries */}
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory min-h-[420px] sm:min-h-[450px] md:h-[525px] w-full justify-center">
        {/* Cover als erste Seite */}
        <div className="flex-shrink-0 snap-start">
          <CoverPreview
            coverType={book.cover_type as CoverType}
            coverValue={book.cover_value}
            title={book.cover_title}
            textColor={book.text_color as TextColor}
            showProfile={book.show_profile}
            memorialData={memorialData}
            isEditing={false}
          />
        </div>

        {/* Entry Cards als weitere Seiten */}
        {entries.length === 0 ? (
          <div className="flex-shrink-0 snap-start">
            <div className="h-full min-h-[450px] max-h-[600px] aspect-[2/3] max-w-[400px] border-2 border-dashed border-interactive-default rounded-md flex flex-col items-center justify-center bg-primary p-6">
              <p className="text-body-m text-secondary text-center">
                Noch keine Einträge vorhanden.
              </p>
              <p className="text-body-s text-tertiary mt-1 text-center">
                Sei der Erste, der eine Kondolenz hinterlässt.
              </p>
            </div>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex-shrink-0 snap-start">
              <EntryCard
                entry={entry}
                isOwn={entry.user_id === currentUserId}
                isAdmin={false}
                onEdit={
                  entry.user_id === currentUserId
                    ? () => handleOpenEditModal(entry)
                    : undefined
                }
                onHide={
                  entry.user_id === currentUserId
                    ? () => handleToggleHide(entry)
                    : undefined
                }
              />
            </div>
          ))
        )}
      </div>

      {/* Condolence Entry Modal */}
      <CondolenceEntryModal
        isOpen={showModal}
        onClose={handleCloseModal}
        memorialId={memorialId}
        bookId={book.id}
        mode={editingEntry ? 'edit' : 'create'}
        existingEntry={editingEntry || undefined}
        onSuccess={handleModalSuccess}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId}
        userName={userName}
        userAvatar={userAvatar}
      />
    </section>
  );
}
