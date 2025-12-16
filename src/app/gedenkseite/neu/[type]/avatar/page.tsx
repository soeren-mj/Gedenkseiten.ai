'use client';

import { useRouter, useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import WizardStepLayout from '@/components/memorial/WizardStepLayout';
import ProfilePreviewCard from '@/components/cards/ProfilePreviewCard';
import { Button } from '@/components/ui/Button';
import PhotoChooseIcon from '@/components/icons/PhotoChooseIcon';
import PhotoDeleteIcon from '@/components/icons/PhotoDeleteIcon';
import { useMemorialWizard } from '@/hooks/useMemorialWizard';
import { useToast } from '@/contexts/ToastContext';

/**
 * Avatar Selection Page - Step 2 of 3
 *
 * User chooses avatar display: Initials (default) or Image upload
 * Simplified design with button in left column and ProfilePreviewCard on right
 */
export default function AvatarPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as 'person' | 'tier';
  const { formData, updateFormData } = useMemorialWizard();
  const { showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get data from wizard context
  const firstName = formData.first_name || '';
  const lastName = formData.last_name || '';
  const birthDate = formData.birth_date || '';
  const deathDate = formData.death_date || '';
  const birthPlace = formData.birth_place || '';
  const deathPlace = formData.death_place || '';
  const avatarType = (formData.avatar_type as 'initials' | 'image') || 'initials';
  const avatarUrl = formData.avatar_url || undefined;

  // Handle file selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      // Convert to base64 for preview (will be uploaded on final submit)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateFormData({
          avatar_type: 'image',
          avatar_url: base64,
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        showError('Fehler', 'Fehler beim Lesen der Datei.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      showError('Fehler', 'Ein Fehler ist aufgetreten.');
      setIsUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  // Handle photo button click
  const handlePhotoButtonClick = () => {
    if (avatarUrl) {
      // Delete photo - reset to initials
      updateFormData({
        avatar_type: 'initials',
        avatar_url: undefined,
      });
    } else {
      // Choose photo - open file picker
      fileInputRef.current?.click();
    }
  };

  const handleNext = () => {
    router.push(`/gedenkseite/neu/${type}/sichtbarkeit`);
  };

  const handleBack = () => {
    router.push(`/gedenkseite/neu/${type}`);
  };

  // Left column content: Photo button
  const leftContent = (
    <div className="mt-4">
      <Button
        variant={avatarUrl ? 'negative' : 'secondary'}
        size="sm"
        leftIcon={avatarUrl ? <PhotoDeleteIcon size={16} /> : <PhotoChooseIcon size={16} />}
        onClick={handlePhotoButtonClick}
        disabled={isUploading}
        loading={isUploading}
      >
        {avatarUrl ? 'Foto löschen' : 'Foto wählen'}
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );

  return (
    <WizardStepLayout
      currentStep={2}
      totalSteps={3}
      title="Wähle deine bevorzugte Darstellung"
      description="Entscheide wie persönlich deine Gedenkseite dargestellt werden soll. Standardgemäß erscheinen Initialen bestehend aus dem Vor- und Nachnamen. Für mehr Personalisierung entscheide dich für ein Foto."
      leftContent={leftContent}
      onBack={handleBack}
      onNext={handleNext}
    >
      {/* Profile Preview Card */}
      <div className="flex justify-center">
        <ProfilePreviewCard
          firstName={firstName}
          lastName={lastName}
          birthDate={birthDate}
          deathDate={deathDate}
          birthPlace={birthPlace}
          deathPlace={deathPlace}
          type={type === 'tier' ? 'animal' : 'human'}
          avatarType={avatarType}
          avatarUrl={avatarUrl}
          variant="compact"
          showReactions={false}
          showObituary={false}
          showBadge={false}
          showCallout={false}
          editable={false}
          className="w-full max-w-[320px]"
        />
      </div>
    </WizardStepLayout>
  );
}
