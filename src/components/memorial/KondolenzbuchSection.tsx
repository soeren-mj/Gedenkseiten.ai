'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CoverPreview } from '@/components/kondolenzbuch/CoverPreview';
import { EntryCard } from '@/components/kondolenzbuch/EntryCard';
import { TextArea } from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
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
 * - Entry creation form (if authenticated and no entry yet)
 */
export function KondolenzbuchSection({
  memorialId,
  memorialData,
  isAuthenticated,
  currentUserId,
}: KondolenzbuchSectionProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState<CondolenceBook | null>(null);
  const [entries, setEntries] = useState<CondolenceEntryWithDetails[]>([]);
  const [hasUserEntry, setHasUserEntry] = useState(false);

  // Entry creation state
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryContent, setEntryContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch book and entries
  // Note: GET endpoints are public for public memorials - no auth needed
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch book (public endpoint - no auth required)
      const bookRes = await fetch(`/api/memorials/${memorialId}/condolence-book`);
      const bookData: BookResponse = await bookRes.json();

      if (!bookData.success || !bookData.data) {
        // No book exists
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

  // Handle entry submission
  const handleSubmitEntry = async () => {
    if (!entryContent.trim()) {
      showToast('error', 'Fehler', 'Bitte gib einen Text ein.');
      return;
    }

    try {
      setIsSubmitting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast('error', 'Fehler', 'Du musst angemeldet sein.');
        return;
      }

      const res = await fetch(`/api/memorials/${memorialId}/condolence-book/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: entryContent.trim(),
          images: [],
        }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast('error', 'Fehler', data.error || 'Fehler beim Speichern.');
        return;
      }

      showToast('success', 'Gespeichert', 'Deine Kondolenz wurde gespeichert.');
      setEntryContent('');
      setShowEntryForm(false);
      setHasUserEntry(true);

      // Refresh entries
      await fetchData();
    } catch (error) {
      console.error('Error submitting entry:', error);
      showToast('error', 'Fehler', 'Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle login redirect
  const handleLoginClick = () => {
    router.push(`/auth/login?redirect=/gedenkseite/${memorialId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-light-dark-mode rounded-[20px] p-6 shadow border border-main">
        <h2 className="text-webapp-subsection font-satoshi font-semibold text-primary mb-4">
          Kondolenzbuch
        </h2>
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-40 bg-secondary rounded-md" />
          <div className="h-24 bg-secondary rounded-md" />
        </div>
      </section>
    );
  }

  // No book exists
  if (!book) {
    return null; // Don't show section if admin hasn't created the book
  }

  return (
    <section className="bg-light-dark-mode rounded-[20px] p-6 shadow border border-main">
      <h2 className="text-webapp-subsection font-satoshi font-semibold text-primary mb-6">
        Kondolenzbuch
      </h2>

      {/* Cover Preview */}
      <div className="flex justify-center mb-8">
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

      {/* Entries */}
      {entries.length > 0 && (
        <div className="mb-8">
          <h3 className="text-body-l font-medium text-primary mb-4">
            Einträge ({entries.length})
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isOwn={entry.user_id === currentUserId}
                isAdmin={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state for entries */}
      {entries.length === 0 && (
        <div className="text-center py-8 mb-8">
          <p className="text-secondary">
            Noch keine Einträge vorhanden. Sei der Erste, der eine Kondolenz hinterlässt.
          </p>
        </div>
      )}

      {/* Entry creation section */}
      <div className="border-t border-main pt-6">
        {!isAuthenticated ? (
          // Not logged in - show login prompt
          <div className="text-center">
            <p className="text-secondary mb-4">
              Melde dich an, um eine Kondolenz zu hinterlassen.
            </p>
            <Button variant="secondary" onClick={handleLoginClick}>
              Anmelden
            </Button>
          </div>
        ) : hasUserEntry ? (
          // User already has an entry
          <div className="text-center">
            <p className="text-secondary">
              Du hast bereits einen Eintrag in diesem Kondolenzbuch.
            </p>
          </div>
        ) : showEntryForm ? (
          // Show entry form
          <div className="max-w-xl mx-auto">
            <h3 className="text-body-l font-medium text-primary mb-4">
              Kondolenz hinterlassen
            </h3>
            <TextArea
              value={entryContent}
              onChange={(value) => setEntryContent(value)}
              placeholder="Schreibe deine Kondolenz..."
              maxLength={2000}
              minRows={6}
              showCharacterCount
              className="mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="tertiary"
                onClick={() => {
                  setShowEntryForm(false);
                  setEntryContent('');
                }}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitEntry}
                disabled={isSubmitting || !entryContent.trim()}
              >
                {isSubmitting ? 'Speichern...' : 'Veröffentlichen'}
              </Button>
            </div>
          </div>
        ) : (
          // Show button to open form
          <div className="text-center">
            <Button variant="primary" onClick={() => setShowEntryForm(true)}>
              Kondolenz hinterlassen
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
