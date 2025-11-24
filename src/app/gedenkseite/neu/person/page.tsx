'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { WizardLayout } from '@/components/memorial/WizardLayout';
import { ProgressIndicator } from '@/components/memorial/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { StammdatenForm } from '@/components/memorial/StammdatenForm';
import { type PersonBasicInfo } from '@/lib/validation/memorial-schema';
import { useMemorialWizard } from '@/hooks/useMemorialWizard';
import { useLocalStorageDraft } from '@/hooks/useLocalStorageDraft';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Person Basic Info Page - Step 1 of 3
 *
 * Collects required and optional biographical data for a person memorial
 */
export default function PersonBasicInfoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { formData, updateFormData, setMemorialType } = useMemorialWizard();

  // Auto-save draft
  const { setData: setDraftData } = useLocalStorageDraft<Partial<PersonBasicInfo>>(
    {},
    {
      userId: user?.id || 'anonymous',
      memorialType: 'person'
    }
  );

  // Set memorial type on mount
  useEffect(() => {
    setMemorialType('person');
  }, [setMemorialType]);

  // Submit handler - navigate to next step
  const onSubmit = (data: PersonBasicInfo) => {
    updateFormData(data);
    router.push('/gedenkseite/neu/person/avatar');
  };

  // Auto-save handler
  const handleChange = (data: Partial<PersonBasicInfo>) => {
    setDraftData(data);
  };

  // Back handler
  const handleBack = () => {
    router.push('/gedenkseite/neu');
  };

  return (
    <WizardLayout
      greetingText="hier kannst du den Namen, sowie die Geburts- und Sterbeinformationen angeben."
      backButtonText="Zurück"
      onBack={handleBack}
      footerContent={
        <Button type="submit" form="person-basic-info-form">
          Weiter
        </Button>
      }
    >
      {/* Progress Indicator */}
      <ProgressIndicator currentStep={1} totalSteps={3} className="mb-6" />

      {/* Headline */}
      <div className="mb-12 text-center">
        <h1 className="text-webapp-subsection text-bw mb-8">
          Für wen möchtest du eine Gedenkseite anlegen?
        </h1>
      </div>

      {/* Stammdaten Form */}
      <StammdatenForm
        mode="wizard"
        initialData={formData as Partial<PersonBasicInfo>}
        onSubmit={onSubmit}
        onChange={handleChange}
        formId="person-basic-info-form"
      />
    </WizardLayout>
  );
}
