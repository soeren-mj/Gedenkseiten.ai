'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WizardLayout } from '@/components/memorial/WizardLayout';
import { ProgressIndicator } from '@/components/memorial/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { RadioButton } from '@/components/ui/RadioButton';
import { useMemorialWizard } from '@/hooks/useMemorialWizard';

type PrivacyLevel = 'public' | 'private';

/**
 * Privacy Settings Page - Step 3 of 3
 *
 * User selects memorial privacy level: Public, Private, or Full Control (disabled)
 * Dynamic route works for both /person/sichtbarkeit and /tier/sichtbarkeit
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

      {/* Privacy Options */}
      <div className="max-w-[611px] mx-auto flex flex-col gap-3">

        {/* Section Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-webapp-body text-bw">Sichtbarkeit der Gedenkseite</h2>
          <div className="border-b border-main"></div>
        </div>

        {/* Public Option */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <GlobeIcon className="w-5 h-5 text-primary" />
              <p className="text-webapp-group text-primary">Öffentlich</p>
            </div>
            <p className="text-secondary text-body-s">
            Deine Gedenkseite ist öffentlich zu finden und erscheint auch in der Suche
            </p>
          </div>
          <RadioButton
            checked={privacyLevel === 'public'}
            onChange={() => setPrivacyLevel('public')}
          />
        </div>

        {/* Private Option */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-primary" />
              <p className="text-webapp-group text-primary">Privat</p>
            </div>
            <p className="text-secondary text-body-s">
            Deine Seite ist privat und nur über einen Einladungs-Link zu erreichen. In unserer Suche erscheint nur der Name, Personen dürfen dich um Zugriff bitten. Du kannst diese Einstellung jederzeit ändern.
            </p>
          </div>
          <RadioButton
            checked={privacyLevel === 'private'}
            onChange={() => setPrivacyLevel('private')}
          />
        </div>

        {/* Full Control Option - Disabled */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-interactive-disabled" />
              <p className="text-webapp-group text-interactive-disabled ">Volle Kontrolle</p>
              <span className="px-2 py-1 text-chip bg-accent-yellow text-inverted-primary rounded-full opacity-50 hidden">
                PREMIUM
              </span>
              <span className="px-2 py-1 text-chip bg-chip-bald-verfuegbar text-chip-bald-verfuegbar rounded-full">
                BALD VERFÜGBAR
              </span>
            </div>
            <p className="text-interactive-disabled text-body-s">
            Du hast die volle Kontrolle. Entscheide in den Einstellungen, wie deine Seite zu finden ist und wer Zugriff erhält. Zusätzlich zum Einladungs-Link kannst du deine Seite mit einem Passwort sichern.
            </p>
          </div>
          <RadioButton
            checked={false}
            disabled={true}
          />
        </div>
      </div>
    </WizardLayout>
  );
}

/**
 * Icon Components
 */
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    </svg>
  );
}
