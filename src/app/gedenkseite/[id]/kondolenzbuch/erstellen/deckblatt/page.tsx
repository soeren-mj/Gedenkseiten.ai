'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import BackendHeader from '@/components/dashboard/BackendHeader';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import { useMemorial } from '@/contexts/MemorialContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { CoverPreview } from '@/components/kondolenzbuch/CoverPreview';
import { CoverBackgroundTabs } from '@/components/kondolenzbuch/CoverBackgroundTabs';
import { createClient } from '@/lib/supabase/client';
import { CoverType, TextColor } from '@/lib/supabase';
import { generateDefaultCoverTitle } from '@/lib/condolence-utils';

/**
 * Deckblatt (Cover) Editor Page
 *
 * Wizard-style page for creating or editing the condolence book cover.
 * Layout: Left side description, Right side live preview.
 */
export default function DeckblattPage() {
  const { memorial } = useMemorial();
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  // Get user's first name for greeting
  const userFirstName = user?.name?.split(' ')[0] || 'du';

  // Form state
  const [coverType, setCoverType] = useState<CoverType | null>(null);
  const [coverValue, setCoverValue] = useState('');
  const [title, setTitle] = useState(
    generateDefaultCoverTitle(memorial.first_name, memorial.last_name)
  );
  const [textColor, setTextColor] = useState<TextColor>('white');
  const [showProfile, setShowProfile] = useState(false);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing condolence book data on mount
  useEffect(() => {
    async function fetchExistingBook() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/memorials/${memorial.id}/condolence-book`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const result = await response.json();

      if (result.data) {
        setCoverType(result.data.cover_type);
        setCoverValue(result.data.cover_value);
        setTitle(result.data.cover_title);
        setTextColor(result.data.text_color);
        setShowProfile(result.data.show_profile);
      }
    }

    fetchExistingBook();
  }, [memorial.id]);

  const handleBackgroundSelect = (
    type: CoverType,
    value: string,
    suggestedTextColor: TextColor
  ) => {
    setCoverType(type);
    setCoverValue(value);
    setTextColor(suggestedTextColor);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast('error', 'Fehler', 'Du musst angemeldet sein.');
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `covers/${memorial.id}/cover_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('condolence-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        showToast('error', 'Upload-Fehler', 'Fehler beim Hochladen des Bildes.');
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('condolence-images').getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', 'Upload-Fehler', 'Fehler beim Hochladen des Bildes.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const toggleTextColor = () => {
    setTextColor((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  const handleSave = async () => {
    if (!coverType || !coverValue) {
      showToast('error', 'Fehler', 'Bitte wähle einen Hintergrund aus.');
      return;
    }

    if (!title.trim()) {
      showToast('error', 'Fehler', 'Bitte gib einen Titel ein.');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      // Verify we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('error', 'Fehler', 'Du musst angemeldet sein.');
        setIsSaving(false);
        return;
      }

      const payload = {
        cover_type: coverType,
        cover_value: coverValue,
        cover_title: title.trim(),
        text_color: textColor,
        show_profile: showProfile,
      };

      // First check if condolence book exists
      const checkResponse = await fetch(`/api/memorials/${memorial.id}/condolence-book`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const checkData = await checkResponse.json();

      let response: Response;
      if (checkData.data) {
        // Update existing via PATCH
        response = await fetch(`/api/memorials/${memorial.id}/condolence-book`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new via POST
        response = await fetch(`/api/memorials/${memorial.id}/condolence-book`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Fehler beim Speichern');
      }

      showToast('success', 'Gespeichert', checkData.data ? 'Deckblatt aktualisiert!' : 'Kondolenzbuch erstellt!');
      router.push(`/gedenkseite/${memorial.id}/verwalten/kondolenzbuch`);
    } catch (error: unknown) {
      console.error('Save error:', error);
      const err = error as Error;
      showToast('error', 'Fehler', err.message || 'Fehler beim Speichern.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/gedenkseite/${memorial.id}/verwalten/kondolenzbuch`);
  };

  const isValid = coverType && coverValue && title.trim();

  return (
    <main className="flex flex-col h-screen bg-light-dark-mode">
      {/* Header */}
      <BackendHeader actionLabel="Digitales Kondolenzbuch erstellen" />

      {/* Main Content - Two Column Layout */}
      <div className="pt-4 flex-1">
        <div className="max-w-6xl mx-auto ">
          <div className="flex gap-8 h-[80vh]">
            {/* Left Column - Description */}
            <div className="max-w-xs p-5 flex flex-col justify-end gap-4">
              <h1 className="text-webapp-section text-primary">
                Deckblatt erstellen
              </h1>
              <p className="text-body-m text-secondary">
                Hallo {userFirstName}, gestalte das Deckblatt für dein digitales Kondolenzbuch.
              </p>
              <p className="text-body-m text-secondary">
                Wähle einen Titel und entscheide welchen Hintergrund das Deckblatt
                haben soll. Du kannst wählen zwischen einem eigenen Foto, aus eine
                Farbpalette wählen oder einen vorgefertigten Hintergrund nutzen.
              </p>
            </div>

            {/* Right Column - Preview and Controls */}
            <div className="max-w-lg flex w-full justify-center pb-10">
              {/* Content Wrapper - Breite wird durch Cover bestimmt */}
              <div className="inline-flex flex-col items-center gap-6">
                {/* Cover Preview Container - feste Höhe für korrektes Aspect Ratio */}
                <div className="flex justify-center" style={{ height: 'clamp(480px, 55vh, 600px)' }}>
                  <CoverPreview
                  coverType={coverType}
                  coverValue={coverValue}
                  title={title}
                  textColor={textColor}
                  showProfile={showProfile}
                  memorialData={{
                    firstName: memorial.first_name,
                    lastName: memorial.last_name,
                    avatarUrl: memorial.avatar_url,
                    avatarType: memorial.avatar_type,
                  }}
                  isEditing={true}
                  onTitleChange={setTitle}
                  onToggleTextColor={toggleTextColor}
                />
              </div>

              {/* Background Selection Tabs */}
              <CoverBackgroundTabs
                coverType={coverType}
                coverValue={coverValue}
                onSelect={handleBackgroundSelect}
                onImageUpload={handleImageUpload}
                isUploading={isUploading}
              />

              {/* Profile Toggle - nur anzeigen wenn Hintergrund gewählt */}
              {coverType && coverValue && (
                <div className="w-full flex flex-col gap-2 px-5 max-w-sm">
                  {/* Label + Switch in bg-bw Box */}
                  <div className="flex items-center justify-between bg-bw rounded-xs px-3 py-2">
                    <span className="text-body-m text-primary">
                      Profil anzeigen
                    </span>
                    <Switch
                      checked={showProfile}
                      onCheckedChange={setShowProfile}
                    />
                  </div>
                  {/* Beschreibungstext darunter, leicht eingerückt */}
                  <p className="text-body-xs text-secondary pl-3">
                    Zeigt das Foto und den Name auf dem Deckblatt an, wenn du diese Option aktivierst.
                  </p>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer with Pill */}
      <div className="sticky bottom-0 flex justify-center p-4">
        <div className="flex items-center p-1 bg-bw-opacity-40 backdrop-blur-md rounded-full shadow-lg">
          {/* Abbrechen Button */}
          <div className="rounded-full">
            <Button
              variant="text"
              size="sm"
              leftIcon={<X className="w-4 h-4" />}
              onClick={handleCancel}
            >
              Abbrechen
            </Button>
          </div>
          {/* Weiter Button - farbiger Hintergrund */}
          <div className={`rounded-full ${!isValid || isSaving ? 'bg-interactive-disabled' : 'bg-interactive-primary-default hover:bg-interactive-primary-hover'}`}>
            <Button
              variant="text"
              size="sm"
              rightIcon={<ChevronRightIcon size={16} />}
              onClick={handleSave}
              disabled={!isValid || isSaving}
              loading={isSaving}
              className={!isValid || isSaving ? '' : '!text-interactive-default hover:!text-interactive-default'}
            >
              Weiter
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
