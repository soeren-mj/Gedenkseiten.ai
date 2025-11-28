'use client';

import { useState, useCallback } from 'react';
import { useMemorial } from '@/contexts/MemorialContext';
import { PrivacySelection } from '@/components/memorial/PrivacySelection';
import { createClient } from '@/lib/supabase/client-legacy';
import { useToast } from '@/contexts/ToastContext';

type PrivacyLevel = 'public' | 'private';

/**
 * Privatsphäre Management Page
 *
 * Allows editing of memorial privacy settings.
 * Memorial data is provided by MemorialContext (fetched in layout).
 * Changes are auto-saved on selection with Toast feedback.
 */
export default function PrivatsphaerePage() {
  const { memorial, updateMemorial } = useMemorial();
  const { showSuccess, showError } = useToast();

  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(
    (memorial.privacy_level as PrivacyLevel) || 'public'
  );
  const [isSaving, setIsSaving] = useState(false);

  // Handle privacy level change with auto-save
  const handlePrivacyChange = useCallback(async (value: PrivacyLevel) => {
    // Don't save if value hasn't changed
    if (value === memorial.privacy_level) {
      return;
    }

    // Optimistic UI update
    setPrivacyLevel(value);
    setIsSaving(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        showError('Fehler', 'Nicht authentifiziert. Bitte melde dich erneut an.');
        // Revert to previous value
        setPrivacyLevel(memorial.privacy_level as PrivacyLevel);
        setIsSaving(false);
        return;
      }

      const response = await fetch(`/api/memorials/${memorial.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          privacy_level: value,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Fehler beim Speichern';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server-Fehler (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Update context (triggers sidebar badge update)
      updateMemorial({
        privacy_level: value,
      });

      // Show success toast
      const message = value === 'public'
        ? 'Deine Gedenkseite ist jetzt öffentlich sichtbar.'
        : 'Deine Gedenkseite ist jetzt nur über Einladungen erreichbar.';
      showSuccess('Gespeichert', message);

    } catch (err) {
      console.error('Error saving privacy_level:', err);
      showError('Fehler', err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
      // Revert to previous value
      setPrivacyLevel(memorial.privacy_level as PrivacyLevel);
    } finally {
      setIsSaving(false);
    }
  }, [memorial.id, memorial.privacy_level, updateMemorial, showSuccess, showError]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-webapp-subsection text-primary mb-2">
          Privatsphäre
        </h1>
        <p className="text-body-l text-secondary">
          Bestimme, wer deine Gedenkseite sehen kann.
        </p>
      </div>

      {/* Privacy Selection */}
      <div className="max-w-[611px]">
        <PrivacySelection
          mode="management"
          value={privacyLevel}
          onChange={handlePrivacyChange}
          disabled={isSaving}
        />
      </div>
    </div>
  );
}
