'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useMemorial } from '@/contexts/MemorialContext';
import { Button } from '@/components/ui/Button';
import { MemorialDeletionModal } from '@/components/memorial/MemorialDeletionModal';
import { createClient } from '@/lib/supabase/client';

/**
 * Seite verwalten - Memorial Management Page
 *
 * Contains advanced settings and dangerous actions like deletion.
 * Memorial data is provided by MemorialContext (fetched in layout).
 */
export default function VerwaltungPage() {
  const { memorial } = useMemorial();
  const router = useRouter();

  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);

  // Handle memorial deletion
  const handleMemorialDeletion = async (nameConfirmation: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Nicht authentifiziert. Bitte melde dich erneut an.');
      }

      const response = await fetch(`/api/memorials/${memorial.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ nameConfirmation }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Löschen der Gedenkseite');
      }

      // Success - redirect to dashboard
      router.push('/dashboard?deleted=memorial');
    } catch (err) {
      console.error('Error deleting memorial:', err);
      throw err; // Re-throw to let modal handle error display
    }
  };

  // Build expected name for display
  const memorialName = `${memorial.first_name}${memorial.last_name ? ' ' + memorial.last_name : ''}`.trim();

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
          Seite verwalten
        </h1>
        <p className="text-body-m text-secondary">
          Hier findest du erweiterte Einstellungen für diese Gedenkseite.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="px-4">
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-md p-1">
          <h2 className="px-4 py-2 text-webapp-body text-accent-red">Gefahrenzone</h2>
          <div className="rounded-sm bg-light-dark-mode p-4">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-body-m text-primary mb-1">
                  Gedenkseite löschen
                </p>
                <p className="text-body-s text-tertiary">
                  Die Gedenkseite &quot;{memorialName}&quot; und alle zugehörigen Inhalte werden
                  dauerhaft und unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig
                  gemacht werden.
                </p>
              </div>
              <Button
                variant="negative"
                size="md"
                onClick={() => setIsDeletionModalOpen(true)}
              >
                Gedenkseite löschen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Deletion Modal */}
      <MemorialDeletionModal
        isOpen={isDeletionModalOpen}
        memorial={memorial}
        onClose={() => setIsDeletionModalOpen(false)}
        onConfirm={handleMemorialDeletion}
      />
    </div>
  );
}
