'use client';

import { useRouter } from 'next/navigation';
import { WizardLayout } from '@/components/memorial/WizardLayout';
import AnimalIcon from '@/components/icons/AnimalIcon';
import FamilyIcon from '@/components/icons/FamilyIcon';
import EventIcon from '@/components/icons/EventIcon';

/**
 * Type Selection Page - Entry point for memorial creation
 *
 * User selects memorial type: Person, Tier, Familie (disabled), Ereignis (disabled)
 */
export default function TypeSelectionPage() {
  const router = useRouter();

  const handleTypeSelect = (type: 'person' | 'tier') => {
    router.push(`/gedenkseite/neu/${type}`);
  };

  return (
    <WizardLayout
      greetingText="hier kannst du eine neue Gedenkseite erstellen. Du hast die Wahl zwischen einer Gedenkseite für eine Person oder einem Tier."
      helpText="Wir arbeiten daran zukünftig auch Seiten für ganze Familien und Ereignisse anzubieten."
      backButtonText="Abbrechen"
    >
      {/* Headline */}
      <div className="mb-8">
        <h1 className="text-webapp-section text-bw mb-8">
          Gedenkseite hinzufügen
        </h1>
        <h2 className="text-webapp-subsection text-primary mb-2">
          Welche Art von Gedenkseite möchtest du anlegen?
        </h2>
        <p className="text-body-m text-secondary">
          Wähle eine von vier verschiedenen Seiten-Typen aus.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Person Card */}
        <TypeCard
          icon={<PersonIcon />}
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
          badge="BALD VERFÜGBAR"
          imageUrl="/images/familie-gedenktyp.webp"
        />

        {/* Ereignis Card - Disabled */}
        <TypeCard
          icon={<EventIcon className="w-8 h-8" />}
          title="Ereignis"
          description="Ideal für Unfälle und Ereignisse mit mehreren Verstorbenen"
          disabled
          badge="BALD VERFÜGBAR"
          imageUrl="/images/ereignis-gedenktyp.webp"
        />
      </div>
    </WizardLayout>
  );
}

/**
 * TypeCard Component - Individual memorial type card with hero image
 */
interface TypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
  imageUrl?: string;
}

function TypeCard({ icon, title, description, onClick, disabled, badge, imageUrl }: TypeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-start justify-start relative overflow-hidden rounded-md shadow-card p-2 bg-bw-opacity-80 transition-all text-left
        ${
          disabled
            ? 'border-main cursor-not-allowed opacity-40'
            : 'border-main hover:border-interactive-primary-default hover:shadow-lg cursor-pointer'
        }
      `}
    >
      {/* Hero Image */}
      <div className="relative h-44 w-full overflow-hidden rounded-t-sm rounded-b-none bg-primary">
        {imageUrl ? (
          <div
            className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-tertiary">
            <div className="text-secondary opacity-50">
              {icon}
            </div>
          </div>
        )}

        {/* Badge Overlay */}
        {badge && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 text-body-xs font-medium bg-accent backdrop-blur-sm text-primary rounded-full">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="px-2 pb-2 pt-4 w-full">
        {/* Title with Icon */}
        <div className="flex items-center justify-between">
          <h3 className="text-webapp-body text-primary">{title}</h3>
          <div className="text-primary w-8 h-8">
            {icon}
          </div>
        </div>

        {/* Description */}
        <p className="text-body-s text-secondary">{description}</p>
      </div>
    </button>
  );
}

/**
 * Icon Components
 */
function PersonIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

