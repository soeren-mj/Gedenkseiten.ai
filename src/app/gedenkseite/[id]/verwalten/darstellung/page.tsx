'use client';

import { useMemorial } from '@/contexts/MemorialContext';
import { AvatarSelection } from '@/components/memorial/AvatarSelection';
import { createClient } from '@/lib/supabase/client-legacy';
import { useState } from 'react';

/**
 * Memorial Darstellung Management Page
 *
 * Allows editing of memorial avatar/display settings.
 * Memorial data is provided by MemorialContext (fetched in layout).
 * Changes are auto-saved to the API.
 */
export default function DarstellungPage() {
  const { memorial, updateMemorial } = useMemorial();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Convert memorial type to component format
  const memorialType = memorial.type === 'pet' ? 'pet' : 'person';

  // Handle avatar change - save to API with auto-delete of old image
  const handleAvatarChange = async (data: { avatar_type: 'initials' | 'icon' | 'image'; avatar_url?: string }) => {
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // Get auth token for API call
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Nicht authentifiziert. Bitte melde dich erneut an.');
        throw new Error('Nicht authentifiziert');
      }

      // If switching away from image, delete old image from storage
      if (memorial.avatar_type === 'image' && data.avatar_type !== 'image' && memorial.avatar_url) {
        try {
          // Extract filename from URL
          const url = new URL(memorial.avatar_url);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];

          console.log('[Darstellung] Deleting old avatar:', fileName);

          const { error: deleteError } = await supabase.storage
            .from('memorial-avatars')
            .remove([fileName]);

          if (deleteError) {
            console.error('[Darstellung] Error deleting old avatar:', deleteError);
            // Don't fail the whole operation if delete fails
          } else {
            console.log('[Darstellung] Old avatar deleted successfully');
          }
        } catch (err) {
          console.error('[Darstellung] Error parsing avatar URL for deletion:', err);
          // Don't fail the whole operation
        }
      }

      // Update via API
      const response = await fetch(`/api/memorials/${memorial.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          avatar_type: data.avatar_type,
          avatar_url: data.avatar_url || null,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Fehler beim Speichern';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response is not JSON (might be HTML error page from dev server)
          errorMessage = `Server-Fehler (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Update context with new avatar data (updates Sidebar immediately)
      updateMemorial({
        avatar_type: data.avatar_type,
        avatar_url: data.avatar_url || null,
      });

      // Show success message briefly
      setSuccessMessage('Darstellung erfolgreich aktualisiert!');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error('Error saving avatar:', err);
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-webapp-subsection text-primary mb-2">
          Darstellung
        </h1>
        <p className="text-body-m text-secondary">
          Hier kannst du die Darstellung der Gedenkseite anpassen.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xs dark:bg-green-900/20 dark:border-green-800">
          <p className="text-body-s text-green-700 dark:text-green-300">
            {successMessage}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xs dark:bg-red-900/20 dark:border-red-800">
          <p className="text-body-s text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* Avatar Selection */}
      <div className="">
        <AvatarSelection
          memorialType={memorialType}
          firstName={memorial.first_name}
          lastName={memorial.last_name || undefined}
          initialAvatarType={memorial.avatar_type as 'initials' | 'icon' | 'image' | undefined}
          initialAvatarUrl={memorial.avatar_url}
          onChange={handleAvatarChange}
        />
      </div>

      {/* Saving Indicator */}
      {isSaving && (
        <div className="mt-4 text-center">
          <p className="text-body-s text-secondary">Wird gespeichert...</p>
        </div>
      )}
    </div>
  );
}
