'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useMemorial } from '@/contexts/MemorialContext';
import { SpruchInput } from '@/components/memorial/SpruchInput';
import { NachrufInput } from '@/components/memorial/NachrufInput';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client-legacy';
import { useToast } from '@/contexts/ToastContext';

/**
 * Spruch und Nachruf Management Page
 *
 * Allows editing of memorial quote (Spruch) and obituary (Nachruf).
 * Memorial data is provided by MemorialContext (fetched in layout).
 * Changes are auto-saved on blur with Toast feedback.
 */
export default function SpruchNachrufPage() {
  const { memorial, updateMemorial } = useMemorial();
  const { showSuccess, showError } = useToast();

  // Local state for form values
  const [spruch, setSpruch] = useState(memorial.memorial_quote || '');
  const [nachruf, setNachruf] = useState(memorial.obituary || '');
  const [isSavingSpruch, setIsSavingSpruch] = useState(false);
  const [isSavingNachruf, setIsSavingNachruf] = useState(false);

  // Save function for API calls
  const saveField = useCallback(async (
    field: 'memorial_quote' | 'obituary',
    value: string
  ): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        showError('Fehler', 'Nicht authentifiziert. Bitte melde dich erneut an.');
        return false;
      }

      const response = await fetch(`/api/memorials/${memorial.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          [field]: value || null,
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

      // Update context
      updateMemorial({
        [field]: value || null,
      });

      return true;
    } catch (err) {
      console.error(`Error saving ${field}:`, err);
      showError('Fehler', err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
      return false;
    }
  }, [memorial.id, updateMemorial, showError]);

  // Handle Spruch save
  const handleSpruchSave = useCallback(async (value: string) => {
    // Don't save if value hasn't changed
    if (value === (memorial.memorial_quote || '')) {
      return;
    }

    setIsSavingSpruch(true);
    const success = await saveField('memorial_quote', value);
    setIsSavingSpruch(false);

    if (success) {
      showSuccess('Gespeichert', 'Der Spruch wurde erfolgreich gespeichert.');
    }
  }, [memorial.memorial_quote, saveField, showSuccess]);

  // Handle Nachruf save
  const handleNachrufSave = useCallback(async (value: string) => {
    // Don't save if value hasn't changed
    if (value === (memorial.obituary || '')) {
      return;
    }

    setIsSavingNachruf(true);
    const success = await saveField('obituary', value);
    setIsSavingNachruf(false);

    if (success) {
      showSuccess('Gespeichert', 'Der Nachruf wurde erfolgreich gespeichert.');
    }
  }, [memorial.obituary, saveField, showSuccess]);

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
          Spruch und Nachruf
        </h1>
        <p className="text-body-m text-secondary">
          Verleihe deiner Gedenkseite eine persönliche Note.
        </p>
      </div>

      {/* Main Panel */}
      <div className="px-4">
        <div className="flex flex-col gap-8 p-4 border border-card rounded-xs bg-primary">
          {/* Spruch Section */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
            </div>
            <SpruchInput
              value={spruch}
              onChange={setSpruch}
              onSave={handleSpruchSave}
              disabled={isSavingSpruch}
            />
          </div>

          {/* Nachruf Section */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
            </div>
            <NachrufInput
              value={nachruf}
              onChange={setNachruf}
              onSave={handleNachrufSave}
              disabled={isSavingNachruf}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
