'use client';

import { RadioButton } from '@/components/ui/RadioButton';
import { PublicIcon } from '@/components/icons/PublicIcon';
import { PrivateIcon } from '@/components/icons/PrivateIcon';
import { FullControlIcon } from '@/components/icons/FullControlIcon';

type PrivacyLevel = 'public' | 'private';

interface PrivacySelectionProps {
  /** @deprecated No longer used - component is now identical for both wizard and management */
  mode?: 'wizard' | 'management';
  value: PrivacyLevel;
  onChange: (value: PrivacyLevel) => void;
  disabled?: boolean;
}

/**
 * PrivacySelection Component
 *
 * Reusable component for selecting memorial privacy level.
 * Used in both wizard flow (creation) and management area (editing).
 *
 * Options:
 * - Public: Memorial is publicly visible and appears in search
 * - Private: Memorial is only accessible via invitation link
 * - Full Control: (disabled) Premium feature for advanced privacy settings
 */
export function PrivacySelection({
  mode: _mode,
  value,
  onChange,
  disabled = false,
}: PrivacySelectionProps) {
  // _mode is deprecated and no longer used - component is now identical for both wizard and management
  void _mode;
  const handleChange = (newValue: PrivacyLevel) => {
    if (disabled) return;
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Public Option */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <PublicIcon className={value === 'public' ? 'text-primary' : 'text-secondary'} />
            <p className={`text-webapp-group ${value === 'public' ? 'text-primary' : 'text-secondary'}`}>
              Öffentlich
            </p>
          </div>
          <p className="text-secondary text-body-s">
            Deine Gedenkseite ist öffentlich zu finden und erscheint in unserer Suche
          </p>
        </div>
        <RadioButton
          checked={value === 'public'}
          onChange={() => handleChange('public')}
          disabled={disabled}
        />
      </div>

      {/* Private Option */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <PrivateIcon className={value === 'private' ? 'text-primary' : 'text-secondary'} />
            <p className={`text-webapp-group ${value === 'private' ? 'text-primary' : 'text-secondary'}`}>
              Privat
            </p>
          </div>
          <p className="text-secondary text-body-s">
            Du entscheidest wer Zugriff erhält. Personen haben nur über einen Einladungs-Link die Möglichkeit deine Gedenkseite zu besuchen. In unserer Suche erscheint der Name der Gedenkseite mit der Informationen dich als verwaltende Personen um Zugriffe zu bitten.
          </p>
        </div>
        <RadioButton
          checked={value === 'private'}
          onChange={() => handleChange('private')}
          disabled={disabled}
        />
      </div>

      {/* Full Control Option - Always Disabled */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FullControlIcon className="text-interactive-disabled" />
            <p className="text-webapp-group text-interactive-disabled">Volle Kontrolle</p>
          </div>
          <p className="text-interactive-disabled text-body-s">
            Du hast die volle Kontrolle über die Sichtbarkeit und den Zugriff. Entscheide wie deine Seite zu finden ist und wer Zugriff erhält. Zusätzlich zum Einladungs-Link kannst du deine Seite auch mit einem Passwort sichern.
          </p>
        </div>
        <span className="text-body-s text-interactive-disabled whitespace-nowrap">bald verfügbar</span>
      </div>

    </div>
  );
}
