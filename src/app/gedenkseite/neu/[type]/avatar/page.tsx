'use client';

import { useRouter, useParams } from 'next/navigation';
import { WizardLayout } from '@/components/memorial/WizardLayout';
import { ProgressIndicator } from '@/components/memorial/ProgressIndicator';
import { AvatarSelection } from '@/components/memorial/AvatarSelection';
import { Button } from '@/components/ui/Button';
import { useMemorialWizard } from '@/hooks/useMemorialWizard';

/**
 * Avatar Selection Page - Step 2 of 3
 *
 * User chooses avatar style: Initials (auto-generated), Icon (default), or Image upload
 * Dynamic route works for both /person/avatar and /tier/avatar
 */
export default function AvatarPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as 'person' | 'tier';
  const { formData, updateFormData } = useMemorialWizard();

  // Get name from form data
  const firstName = formData.first_name || '';
  const lastName = formData.last_name || '';

  // Convert 'tier' to 'pet' for component
  const memorialType = type === 'tier' ? 'pet' : 'person';

  // Handle avatar change - save to localStorage
  const handleAvatarChange = async (data: { avatar_type: 'initials' | 'icon' | 'image'; avatar_url?: string }) => {
    updateFormData({
      avatar_type: data.avatar_type,
      avatar_url: data.avatar_url || undefined,
    });
  };

  const handleNext = () => {
    router.push(`/gedenkseite/neu/${type}/sichtbarkeit`);
  };

  const handleBack = () => {
    router.push(`/gedenkseite/neu/${type}`);
  };

  return (
    <WizardLayout
      greetingText="Entscheide wie persönlich deine Gedenkseite dargestellt werden soll. Du kannst zwischen Initialen, einem neutralen Personen-Icon und einem von dir hochgeladenen Bild wählen."
      helpText="Es gibt zwei Darstellungsformen: Ein großes Profilbild und ein kleines rundes Avatar-Bild."
      backButtonText="Zurück"
      onBack={handleBack}
      footerContent={
        <Button onClick={handleNext}>
          Weiter
        </Button>
      }
    >
      <ProgressIndicator currentStep={2} totalSteps={3} className="mb-6" />

      <AvatarSelection
        memorialType={memorialType}
        firstName={firstName}
        lastName={lastName}
        initialAvatarType={formData.avatar_type as 'initials' | 'icon' | 'image' | undefined}
        initialAvatarUrl={formData.avatar_url || null}
        onChange={handleAvatarChange}
      />
    </WizardLayout>
  );
}
