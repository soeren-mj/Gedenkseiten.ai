'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useMemorial } from '@/contexts/MemorialContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import ProfilePreviewCard from '@/components/cards/ProfilePreviewCard';
import { createClient } from '@/lib/supabase/client-legacy';

const GENERIC_ERROR = 'Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.';

/**
 * Memorial Darstellung Management Page
 *
 * Allows editing of memorial avatar/display settings.
 * Uses ProfilePreviewCard with editable hover pattern (like Notion).
 * Changes are auto-saved with toast feedback.
 */
export default function DarstellungPage() {
  const { memorial, updateMemorial } = useMemorial();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      showError('Fehler', 'Datei zu groß. Maximal 2 MB erlaubt.');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showError('Fehler', 'Nur JPG, PNG und WebP werden unterstützt.');
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        showError('Fehler', GENERIC_ERROR);
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;

      // Upload to memorial-avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('memorial-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('[Darstellung] Upload error:', uploadError);
        showError('Fehler', 'Fehler beim Hochladen. Bitte versuche es erneut.');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memorial-avatars')
        .getPublicUrl(fileName);

      // Delete old avatar if exists
      if (memorial.avatar_url) {
        try {
          const url = new URL(memorial.avatar_url);
          const pathParts = url.pathname.split('/');
          const oldFileName = pathParts[pathParts.length - 1];
          await supabase.storage.from('memorial-avatars').remove([oldFileName]);
        } catch (err) {
          console.warn('[Darstellung] Error deleting old avatar:', err);
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
          avatar_type: 'image',
          avatar_url: publicUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      // Update context
      updateMemorial({
        avatar_type: 'image',
        avatar_url: publicUrl,
      });

      showSuccess('Gespeichert', 'Foto erfolgreich hochgeladen!');

    } catch (err) {
      console.error('[Darstellung] Error:', err);
      showError('Fehler', GENERIC_ERROR);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle avatar delete (reset to initials)
  const handleAvatarDelete = async () => {
    setIsUploading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        showError('Fehler', GENERIC_ERROR);
        return;
      }

      // Delete image from storage if exists
      if (memorial.avatar_url) {
        try {
          const url = new URL(memorial.avatar_url);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          await supabase.storage.from('memorial-avatars').remove([fileName]);
        } catch (err) {
          console.warn('[Darstellung] Error deleting avatar:', err);
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
          avatar_type: 'initials',
          avatar_url: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      // Update context
      updateMemorial({
        avatar_type: 'initials',
        avatar_url: null,
      });

    } catch (err) {
      console.error('[Darstellung] Error:', err);
      showError('Fehler', GENERIC_ERROR);
    } finally {
      setIsUploading(false);
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
          Wähle deine bevorzugte Darstellung
        </h1>
        <p className="text-body-m text-secondary">
          Entscheide wie persönlich deine Gedenkseite dargestellt werden soll. Standardgemäß erscheinen Initialen bestehend aus dem Vor- und Nachnamen. Für mehr Personalisierung entscheide dich für ein Foto.
        </p>
        <p className="text-body-m text-accent mt-2">
          Bewege deine Maus über das Bild für mehr Optionen.
        </p>
      </div>

      {/* Profile Preview Card with editable mode */}
      <div className="flex justify-center px-4 pb-12">
        <ProfilePreviewCard
          firstName={memorial.first_name}
          lastName={memorial.last_name || ''}
          birthDate={memorial.birth_date || ''}
          deathDate={memorial.death_date || ''}
          birthPlace={memorial.birth_place || ''}
          deathPlace={memorial.death_place || ''}
          type={memorial.type === 'pet' ? 'animal' : 'human'}
          avatarType={memorial.avatar_type}
          avatarUrl={memorial.avatar_url || undefined}
          variant="compact"
          showReactions={false}
          showObituary={false}
          showBadge={false}
          showCallout={false}
          editable={true}
          onAvatarUpload={handleAvatarUpload}
          onAvatarDelete={handleAvatarDelete}
          isUploading={isUploading}
          className="w-full max-w-[320px]"
        />
      </div>
    </div>
  );
}
