'use client';

import { useMemorial } from '@/contexts/MemorialContext';
import { StammdatenForm } from '@/components/memorial/StammdatenForm';
import { type PersonBasicInfo } from '@/lib/validation/memorial-schema';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client-legacy';

/**
 * Memorial Stammdaten Management Page
 *
 * Allows editing of basic memorial information.
 * Memorial data is provided by MemorialContext (fetched in layout).
 */
export default function StammdatenPage() {
  const { memorial } = useMemorial();
  const [error, setError] = useState<string | null>(null);

  // Convert memorial data to form format
  const initialData: Partial<PersonBasicInfo> = {
    gender: memorial.gender || undefined,
    salutation: memorial.salutation || undefined,
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

  // Submit handler - save to API
  const handleSubmit = async (data: PersonBasicInfo) => {
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
        } catch (parseError) {
          // Response is not JSON (might be HTML error page from dev server)
          errorMessage = `Server-Fehler (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Success - form component will show success message
    } catch (err) {
      console.error('Error saving memorial:', err);
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
      throw err; // Re-throw to let form component handle loading state
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-webapp-subsection text-primary mb-2">
          Stammdaten
        </h1>
        <p className="text-body-m text-secondary">
          Hier kannst du die grundlegenden Informationen zur Gedenkseite bearbeiten.
        </p>
      </div>

      {/* Stammdaten Form */}
      <StammdatenForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        error={error}
      />
    </div>
  );
}
