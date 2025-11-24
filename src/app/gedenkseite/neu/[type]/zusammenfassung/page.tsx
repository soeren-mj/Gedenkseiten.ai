'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WizardLayout } from '@/components/memorial/WizardLayout';
import ProfilePreviewCard from '@/components/cards/ProfilePreviewCard';
import { Button } from '@/components/ui/Button';
import { useMemorialWizard } from '@/hooks/useMemorialWizard';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client-legacy';
import { logger } from '@/lib/utils/logger';

/**
 * Summary Page - Final step before creation
 *
 * Displays preview of memorial data and optional content options
 * User can review and create the memorial
 */
export default function SummaryPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as 'person' | 'tier';
  const { user } = useAuth();
  const { formData, reset } = useMemorialWizard();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract form data
  const firstName = formData.first_name || '';
  const lastName = formData.last_name || '';
  const birthDate = formData.birth_date || '';
  const deathDate = formData.death_date || '';
  const birthPlace = formData.birth_place || '';
  const deathPlace = formData.death_place || '';
  const privacyLevel = formData.privacy_level || 'public';
  const avatarType = formData.avatar_type || 'initials';
  const avatarUrl = formData.avatar_url;

  // Store preview props in ref to freeze them during creation
  const previewPropsRef = useRef({
    firstName,
    lastName,
    birthDate,
    deathDate,
    birthPlace,
    deathPlace,
    avatarType: avatarType as 'initials' | 'icon' | 'image',
    avatarUrl,
    type: type === 'tier' ? 'animal' as const : 'human' as const,
  });

  // Update ref only when NOT creating (freeze during creation)
  useEffect(() => {
    if (!isCreating) {
      previewPropsRef.current = {
        firstName,
        lastName,
        birthDate,
        deathDate,
        birthPlace,
        deathPlace,
        avatarType: avatarType as 'initials' | 'icon' | 'image',
        avatarUrl,
        type: type === 'tier' ? 'animal' as const : 'human' as const,
      };
    }
  }, [isCreating, firstName, lastName, birthDate, deathDate, birthPlace, deathPlace, avatarType, avatarUrl, type]);

  // Create memorial
  const handleCreateMemorial = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Prepare payload (dates are already in ISO format from InlineDatePicker)
      const payload = {
        type,
        first_name: firstName,
        last_name: type === 'person' ? lastName : undefined,
        birth_date: birthDate,
        death_date: deathDate,
        birth_place: birthPlace || undefined,
        death_place: deathPlace || undefined,
        avatar_type: avatarType,
        avatar_url: avatarUrl || undefined,
        privacy_level: privacyLevel,
        // Person-specific fields
        ...(type === 'person' && {
          gender: formData.gender,
          salutation: formData.salutation,
          title: formData.title,
          second_name: formData.second_name,
          birth_name: formData.birth_name,
          name_suffix: formData.name_suffix,
          nickname: formData.nickname,
        }),
        // Pet-specific fields
        ...(type === 'tier' && {
          animal_type_id: formData.animal_type_id,
          breed_group_id: formData.breed_group_id,
          breed_id: formData.breed_id,
          gender: formData.gender,
          nickname: formData.nickname,
        }),
      };

      // Get auth token for API call
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Nicht authentifiziert. Bitte melde dich erneut an.');
        setIsCreating(false);
        return;
      }

      // API call with auth token
      const response = await fetch('/api/memorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to management page with welcome banner
        // NOTE: Reset happens AFTER navigation to prevent data loss during transition
        router.push(`${data.redirect_url}?welcome=true`);

        // Clear draft and wizard state after navigation starts
        // Using setTimeout to ensure navigation begins first
        setTimeout(() => {
          reset();
          // Clear localStorage draft
          if (user?.id) {
            localStorage.removeItem(`memorial-draft-${user.id}-${type}`);
          }
        }, 100);
      } else {
        setError(data.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (err) {
      logger.error({
        context: 'Summary:createMemorial',
        error: err,
        additionalData: { memorialType: type },
        userId: user?.id,
      });
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    router.push(`/gedenkseite/neu/${type}/sichtbarkeit`);
  };

  return (
    <WizardLayout
      backButtonText="Zurück"
      onBack={handleBack}
      sidebarPreview={
        <ProfilePreviewCard
          {...previewPropsRef.current}
          variant="compact"
          showReactions={false}
          showObituary={false}
          showBadge={false}
          showCallout={false}
        />
      }
      footerContent={
        <Button variant="primary" onClick={handleCreateMemorial} disabled={isCreating} loading={isCreating}>
          {isCreating ? 'Erstelle Seite...' : 'Weiter'}
        </Button>
      }
    >
      <div className="mb-8 text-center">
        <h1 className="text-webapp-subsection text-bw mb-2">🎉 <span className="text-accent">Glückwunsch </span>, du bist so gut wie fertig.</h1>
        <p className="text-body-m text-secondary">
          Du hast bereits genügend Informationen angegeben, um deine Seite zu veröffentlichen. <br />
          Füge weitere Inhalte hinzu, um deine Seite erlebbarer zu gestalten.
        </p>
      </div>

      {/* Content Options */}
      <div className="max-w-[611px] mx-auto flex flex-col gap-4">
          {/* Free Content Section */}
          <div className="flex flex-col gap-1">
            <h2 className="text-webapp-body text-bw">Kostenfreie Inhalte</h2>
            <div className="border-b border-main"></div>
          </div>

          <div className="flex flex-col gap-3">
              <ContentOption
                title="Spruch"
                description="Als dezentes Element ist der Spruch die erste persönliche Note (max. 160 Zeichen). Für Besucher ist der Spruch meinst einfacher zu lesen als der Nachruf."
                badge="EMPFEHLUNG"
                buttonText="Bald verfügbar"
                disabled
              />
              <ContentOption
                title="Nachruf"
                description="Mit dem Nachruf hast du die Möglichkeit eine ausführliche Würdigung des Lebens und der Leistungen zu hinterlassen."
                badge="EMPFEHLUNG"
                buttonText="Bald verfügbar"
                disabled
              />
              <ContentOption
                title="Wissenswertes"
                description="Du kannst hier interessante Details zum Leben der Person festhalten wie zum Beispiel besondere Leistungen oder Hobbys."
                badge="EMPFEHLUNG"
                buttonText="Bald verfügbar"
                disabled
              />
              <ContentOption
                title="Kondolenzbuch"
                description="Erstelle eine Möglichkeit für Gäste ihre Anteilnahme und persönlichen Worte zu verewigen."
                badge="EMPFEHLUNG"
                buttonText="Bald verfügbar"
                disabled
              />
              <ContentOption
                title="Termine"
                description="Jahrestage, Beerdigung, Gedenkfeiern"
                buttonText="Bald verfügbar"
                disabled
              />
            </div>

        {/* Premium Content Section */}
        <div className="flex flex-col gap-1 mt-4">
          <h2 className="text-webapp-body text-bw">Premium Inhalte</h2>
          <div className="border-b border-main"></div>
        </div>

        <div className="flex flex-col gap-3">
            <ContentOption
              title="Erinnerungen"
              description="Erinnerungen sind Foto und Video Rückblicke die du erstellen kannst."
              buttonText="Bald verfügbar"
              disabled
              premium
            />
          </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
            {error}
          </div>
        )}
      </div>
    </WizardLayout>
  );
}

/**
 * ContentOption Component
 */
interface ContentOptionProps {
  title: string;
  description: string;
  badge?: 'EMPFEHLUNG' | 'PREMIUM';
  buttonText: string;
  disabled?: boolean;
  premium?: boolean;
  onAction?: () => void;
}

function ContentOption({
  title,
  description,
  badge,
  buttonText,
  disabled,
  premium,
  onAction,
}: ContentOptionProps) {
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-webapp-group text-primary">{title}</p>
          {badge && (
            <span
              className={`px-2 py-1 text-chip rounded-full ${
                badge === 'EMPFEHLUNG'
                  ? 'bg-chip-empfehlung text-chip-empfehlung'
                  : 'bg-chip-premium text-chip-premium'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-body-s text-secondary">{description}</p>
      </div>
      <Button variant="secondary" size="xs" disabled={disabled} onClick={onAction}>
        {buttonText}
      </Button>
    </div>
  );
}
