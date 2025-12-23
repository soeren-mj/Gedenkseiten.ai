'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import WizardStepLayout from '@/components/memorial/WizardStepLayout';
import ProfilePreviewCard from '@/components/cards/ProfilePreviewCard';
import { PrivacySelection } from '@/components/memorial/PrivacySelection';
import { useMemorialWizard } from '@/hooks/useMemorialWizard';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

type PrivacyLevel = 'public' | 'private';

/**
 * Privacy Settings Page - Step 3 of 3 (Final Step)
 *
 * User selects memorial privacy level and creates the memorial.
 * This is now the final step - the summary page has been removed.
 */
export default function PrivacyPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as 'person' | 'tier';
  const { user } = useAuth();
  const { formData, updateFormData, reset } = useMemorialWizard();

  // Privacy selection state
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(
    (formData.privacy_level as PrivacyLevel) || 'public'
  );

  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract form data for preview
  const firstName = formData.first_name || '';
  const lastName = formData.last_name || '';
  const birthDate = formData.birth_date || '';
  const deathDate = formData.death_date || '';
  const birthPlace = formData.birth_place || '';
  const deathPlace = formData.death_place || '';
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
    avatarType: avatarType as 'initials' | 'image',
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
        avatarType: avatarType as 'initials' | 'image',
        avatarUrl,
        type: type === 'tier' ? 'animal' as const : 'human' as const,
      };
    }
  }, [isCreating, firstName, lastName, birthDate, deathDate, birthPlace, deathPlace, avatarType, avatarUrl, type]);

  // Create memorial
  const handleCreateMemorial = async () => {
    // First update formData with current privacy level
    updateFormData({ privacy_level: privacyLevel });

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

      // Check for HTTP errors before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Ein Fehler ist aufgetreten';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Ignore JSON parse errors on error responses
        }
        setError(errorMessage);
        return;
      }

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
        context: 'Privacy:createMemorial',
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
    router.push(`/gedenkseite/neu/${type}/avatar`);
  };

  return (
    <WizardStepLayout
      currentStep={3}
      totalSteps={3}
      title="Glückwunsch, das ist schon der letzte Schritt"
      description="Jetzt kannst du die Erstellung deiner Gedenkseite abschließen. Entscheide dich noch kurz ob die Seite Öffentlich oder Privat sein soll. Im Anschluss gelangst du in die Übersicht und kannst in Ruhe weitere Inhalte hinzufügen."
      leftContent={
        <>
          {/* Privacy Selection Box */}
          <div className="bg-bw-opacity-40 rounded-md shadow-card p-1 mt-4">
            <h2 className="px-4 py-2 text-webapp-body text-bw">Status der Seite</h2>
            <div className="rounded-sm bg-light-dark-mode p-4">
              <PrivacySelection
                mode="wizard"
                value={privacyLevel}
                onChange={setPrivacyLevel}
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
              {error}
            </div>
          )}
        </>
      }
      onBack={handleBack}
      onNext={handleCreateMemorial}
      nextLabel="Gedenkseite erstellen"
      nextLoading={isCreating}
    >
      {/* Profile Preview Card */}
      <div className="flex justify-center"> 
        <ProfilePreviewCard
        {...previewPropsRef.current}
        variant="compact"
        showReactions={false}
        showObituary={false}
        showBadge={false}
        showCallout={false}
        showPrivacyBadge={true}
        privacyLevel={privacyLevel}
        className="w-full max-w-[320px]"
      /></div>

    </WizardStepLayout>
  );
}
