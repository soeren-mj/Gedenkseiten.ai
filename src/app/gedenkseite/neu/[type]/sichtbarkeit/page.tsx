'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WizardLayout } from '@/components/memorial/WizardLayout';
import { ProgressIndicator } from '@/components/memorial/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { PrivacySelection } from '@/components/memorial/PrivacySelection';
import { useMemorialWizard } from '@/hooks/useMemorialWizard';

type PrivacyLevel = 'public' | 'private';

/**
 * Privacy Settings Page - Step 3 of 3
 *
 * User selects memorial privacy level: Public, Private, or Full Control (disabled)
 * Dynamic route works for both /person/sichtbarkeit and /tier/sichtbarkeit
 * Uses the reusable PrivacySelection component.
 */
export default function PrivacyPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as 'person' | 'tier';
  const { formData, updateFormData } = useMemorialWizard();

  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(
    (formData.privacy_level as PrivacyLevel) || 'public'
  );

  const handleNext = () => {
    updateFormData({ privacy_level: privacyLevel });
    router.push(`/gedenkseite/neu/${type}/zusammenfassung`);
  };

  const handleBack = () => {
    router.push(`/gedenkseite/neu/${type}/avatar`);
  };

  return (
    <WizardLayout
      backButtonText="Zurück"
      onBack={handleBack}
      footerContent={
        <Button variant="primary" size="md" onClick={handleNext}>
          Weiter
        </Button>
      }
    >
      <ProgressIndicator currentStep={3} totalSteps={3} className="mb-6" />

      <div className="mb-12 text-center p-2">
        <h1 className="text-webapp-subsection text-bw mb-2">Wähle wer die erstellte Gedenkseite sehen kann.</h1>
        <p className="text-body-m text-secondary">Du kannst die Sichtbarkeit jederzeit ändern.</p>
      </div>

      {/* Privacy Selection Component */}
      <div className="max-w-[611px] mx-auto">
        <PrivacySelection
          mode="wizard"
          value={privacyLevel}
          onChange={setPrivacyLevel}
        />
      </div>
    </WizardLayout>
  );
}
