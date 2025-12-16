'use client';

import { useRouter } from 'next/navigation';
import BackendHeader from '@/components/dashboard/BackendHeader';
import TypeCard from '@/components/cards/TypeCard';
import Button from '@/components/ui/Button';
import PersonIcon from '@/components/icons/PersonIcon';
import AnimalIcon from '@/components/icons/AnimalIcon';
import FamilyIcon from '@/components/icons/FamilyIcon';
import EventIcon from '@/components/icons/EventIcon';
import { XIcon } from '@/components/icons/XIcon';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Type Selection Page - Entry point for memorial creation
 *
 * User selects memorial type: Person, Tier, Familie (disabled), Ereignis (disabled)
 */
export default function TypeSelectionPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleTypeSelect = (type: 'person' | 'tier') => {
    router.push(`/gedenkseite/neu/${type}`);
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  // Get user's first name for personalized greeting
  const userName = user?.name?.split(' ')[0] || 'Nutzer';

  return (
    <main className="flex flex-col min-h-screen bg-light-dark-mode">
      {/* Header */}
      <BackendHeader actionLabel="Gedenkseite erstellen" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-12">
          {/* Left Column - Text */}
          <div className="lg:w-1/3 flex flex-col gap-4">
            <h1 className="text-webapp-section text-primary">
              Gedenkseite wählen
            </h1>
            <p className="text-body-m text-secondary">
              Hallo {userName}, welche Art von Gedenkseite möchtest du anlegen?
              Wähle eine von vier verschiedenen Seiten-Typen aus. Aktuell kannst du
              zwischen einem Menschen und einem Tier wählen.
            </p>
            <p className="text-body-m text-tertiary">
              Wir arbeiten daran zukünftig auch Seiten für ganze Familien und
              Ereignisse anzubieten.
            </p>
          </div>

          {/* Right Column - Cards */}
          <div className="lg:flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Person Card */}
              <TypeCard
                icon={<PersonIcon className="w-8 h-8" />}
                title="Eine Person"
                description="Ideal für eine zu gedenkende Person"
                onClick={() => handleTypeSelect('person')}
                imageUrl="/images/person-gedenktyp.jpg"
              />

              {/* Tier Card */}
              <TypeCard
                icon={<AnimalIcon className="w-8 h-8" />}
                title="Ein Tier"
                description="Für ein Tier dem eine Gedenkseite gewidmet werden soll"
                onClick={() => handleTypeSelect('tier')}
                imageUrl="/images/tier-gedenktyp.webp"
              />

              {/* Familie Card - Disabled */}
              <TypeCard
                icon={<FamilyIcon className="w-8 h-8" />}
                title="Familie"
                description="Für Familien die gern gemeinsam auf einer Gedenkseite erscheinen wollen"
                disabled
                badge="Bald verfügbar"
                imageUrl="/images/familie-gedenktyp.webp"
              />

              {/* Ereignis Card - Disabled */}
              <TypeCard
                icon={<EventIcon className="w-8 h-8" />}
                title="Ereignis"
                description="Ideal für Unfälle und Ereignisse mit mehreren Verstorbenen"
                disabled
                badge="Bald verfügbar"
                imageUrl="/images/ereignis-gedenktyp.webp"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Button */}
      <div className="sticky bottom-0 flex justify-center p-4">
        <div className="flex items-center p-1 bg-bw-opacity-40 hover:bg-bw-opacity-60 backdrop-blur-md transition-colors rounded-full shadow-lg">
          <Button
            variant="text"
            size="sm"
            leftIcon={<XIcon/>}
            onClick={handleCancel}
          >
            Abbrechen
          </Button>
        </div>
      </div>
    </main>
  );
}
