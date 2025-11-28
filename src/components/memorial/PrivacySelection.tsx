'use client';

import { Globe, Lock, Settings } from 'lucide-react';
import { RadioButton } from '@/components/ui/RadioButton';
import { Badge } from '@/components/ui/Badge';

type PrivacyLevel = 'public' | 'private';

interface PrivacySelectionProps {
  mode: 'wizard' | 'management';
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
  mode,
  value,
  onChange,
  disabled = false,
}: PrivacySelectionProps) {
  const handleChange = (newValue: PrivacyLevel) => {
    if (disabled) return;
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-webapp-body text-bw">Sichtbarkeit der Gedenkseite</h2>
        <div className="border-b border-main"></div>
      </div>

      {/* Public Option */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Globe className={`w-5 h-5 ${value === 'public' ? 'text-primary' : 'text-secondary'}`} />
            <p className={`text-webapp-group ${value === 'public' ? 'text-primary' : 'text-secondary'}`}>
              Öffentlich
            </p>
          </div>
          <p className="text-secondary text-body-s">
            Deine Gedenkseite ist öffentlich zu finden und erscheint auch in der Suche
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
            <Lock className={`w-5 h-5 ${value === 'private' ? 'text-primary' : 'text-secondary'}`} />
            <p className={`text-webapp-group ${value === 'private' ? 'text-primary' : 'text-secondary'}`}>
              Privat
            </p>
          </div>
          <p className="text-secondary text-body-s">
            Deine Seite ist privat und nur über einen Einladungs-Link zu erreichen. In unserer Suche erscheint nur der Name, Personen dürfen dich um Zugriff bitten. Du kannst diese Einstellung jederzeit ändern.
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
            <Settings className="w-5 h-5 text-interactive-disabled" />
            <p className="text-webapp-group text-interactive-disabled">Volle Kontrolle</p>
            <Badge variant="soon">Bald verfügbar</Badge>
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

      {/* Mode-specific hint */}
      {mode === 'management' && (
        <p className="text-body-xs text-tertiary mt-2">
          Änderungen werden automatisch gespeichert.
        </p>
      )}
    </div>
  );
}
