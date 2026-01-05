'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useMemorial } from '@/contexts/MemorialContext';
import { StammdatenForm } from '@/components/memorial/StammdatenForm';
import { type PersonBasicInfo, type PetBasicInfo } from '@/lib/validation/memorial-schema';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/contexts/ToastContext';
import type { Memorial } from '@/lib/supabase';

// Combined form data type
type FormData = PersonBasicInfo | PetBasicInfo;

/**
 * Memorial Stammdaten Management Page
 *
 * Allows editing of basic memorial information for persons and pets.
 * Memorial data is provided by MemorialContext (fetched in layout).
 */
export default function StammdatenPage() {
  const { memorial, updateMemorial } = useMemorial();
  const { showSuccess, showError } = useToast();
  const [error, setError] = useState<string | null>(null);

  const isPet = memorial.type === 'pet';

  // Convert memorial data to form format - different fields for person vs pet
  const petInitialData: Partial<PetBasicInfo> = {
    first_name: memorial.first_name,
    nickname: memorial.nickname || undefined,
    gender: (memorial.gender as 'männlich' | 'weiblich') || undefined,
    birth_date: memorial.birth_date,
    birth_place: memorial.birth_place || undefined,
    death_date: memorial.death_date,
    death_place: memorial.death_place || undefined,
    animal_type_id: memorial.animal_type_id || undefined,
    breed_group_id: memorial.breed_group_id || undefined,
    breed_id: memorial.breed_id || undefined,
  };

  const personInitialData: Partial<PersonBasicInfo> = {
    gender: (memorial.gender as PersonBasicInfo['gender']) || undefined,
    salutation: (memorial.salutation as PersonBasicInfo['salutation']) || undefined,
    title: memorial.title || undefined,
    first_name: memorial.first_name,
    second_name: memorial.second_name || undefined,
    third_name: memorial.third_name || undefined,
    nickname: memorial.nickname || undefined,
    name_suffix: memorial.name_suffix || undefined,
    last_name: memorial.last_name || undefined,
    birth_name: memorial.birth_name || undefined,
    birth_date: memorial.birth_date,
    birth_place: memorial.birth_place || undefined,
    death_date: memorial.death_date,
    death_place: memorial.death_place || undefined,
    relationship_degree: memorial.relationship_degree || undefined,
    relationship_custom: memorial.relationship_custom || undefined,
  };

  const initialData = isPet ? petInitialData : personInitialData;

  // Submit handler - save to API
  const handleSubmit = async (data: FormData) => {
    setError(null);

    try {
      // Get auth token for API call
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Nicht authentifiziert. Bitte melde dich erneut an.');
        throw new Error('Nicht authentifiziert');
      }

      const response = await fetch(`/api/memorials/${memorial.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
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

      // Success - update context and show toast
      updateMemorial(data as Partial<Memorial>);
      showSuccess('Gespeichert', 'Stammdaten wurden erfolgreich gespeichert.');
    } catch (err) {
      console.error('Error saving memorial:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten';
      setError(errorMessage);
      showError('Fehler', errorMessage);
      throw err; // Re-throw to let form component handle loading state
    }
  };

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
          Stammdaten
        </h1>
        <p className="text-body-m text-secondary">
          {isPet
            ? 'Hier kannst du die Informationen deines verstorbenen Tieres bearbeiten.'
            : 'Hier kannst du die personenbezogenen Informationen des Verstorbenen bearbeiten.'}
        </p>
      </div>

      {/* Main Panel */}
      <div className="px-4">
        <div className="flex flex-col gap-8 p-4 border border-card rounded-xs bg-primary">
          <StammdatenForm
            mode="edit"
            memorialType={memorial.type as 'person' | 'pet'}
            initialData={initialData}
            onSubmit={handleSubmit}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
