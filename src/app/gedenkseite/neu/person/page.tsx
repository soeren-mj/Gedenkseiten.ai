'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WizardStepLayout from '@/components/memorial/WizardStepLayout';
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
  const [isFormValid, setIsFormValid] = useState(false);

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
    <WizardStepLayout
      currentStep={1}
      totalSteps={3}
      title="Angaben zur Person hinzufügen"
      description="Für wen legst du diese Gedenkseite an?"
      onBack={handleBack}
      formId="person-basic-info-form"
      nextDisabled={!isFormValid}
    >
      {/* Stammdaten Form */}
      <div className="flex flex-col gap-8 p-4 border border-card rounded-xs bg-primary">
        <StammdatenForm
          mode="wizard"
          initialData={formData as Partial<PersonBasicInfo>}
          onSubmit={onSubmit}
          onChange={handleChange}
          onValidityChange={setIsFormValid}
          formId="person-basic-info-form"
        />
      </div>
    </WizardStepLayout>
  );
}
