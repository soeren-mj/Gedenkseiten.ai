'use client';

import React from 'react';
import { TextInput } from '@/components/ui/text-input';

const MAX_SPRUCH_LENGTH = 160;

interface SpruchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => Promise<void>;
  disabled?: boolean;
  error?: string;
  showDescription?: boolean;
}

/**
 * SpruchInput - Reusable component for memorial quote/spruch input
 *
 * Used in:
 * - Memorial management page (/gedenkseite/[id]/verwalten/spruch-nachruf)
 * - Memorial creation wizard (future)
 *
 * Features:
 * - Max 160 characters
 * - Character counter always visible
 * - OnBlur auto-save (when onSave prop provided)
 * - 5 states: default, hover, active, filled, complete
 */
export const SpruchInput: React.FC<SpruchInputProps> = ({
  value,
  onChange,
  onSave,
  disabled = false,
  error,
  showDescription = true,
}) => {
  const handleBlur = async (currentValue: string) => {
    if (onSave) {
      await onSave(currentValue);
    }
  };

  return (
    <div className="space-y-2">
      {showDescription && (
        <div className="flex flex-col gap-2 ml-1">
          <h3 className="text-webapp-body text-primary">Spruch</h3>
        <p className="text-body-m text-secondary">
            Als dezentes Element ist der Spruch die erste persönliche Note und wie eine kurze Nachricht zu sehen (stellvertretend dem Grabsteinspruch). Für Besucher ist er einfacher zu konsumieren als der Nachruf.
          </p>
        </div>
      )}
      <TextInput
        label=""
        placeholder="Schreibe etwas..."
        value={value}
        onChange={onChange}
        onBlurValue={handleBlur}
        maxLength={MAX_SPRUCH_LENGTH}
        showCharacterCount
        showClearButton={false}
        disabled={disabled}
        error={error}
      />
    </div>
  );
};
