'use client';

import React from 'react';
import { TextArea } from '@/components/ui/TextArea';

const MAX_NACHRUF_LENGTH = 5000;

interface NachrufInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => Promise<void>;
  disabled?: boolean;
  error?: string;
  showDescription?: boolean;
}

/**
 * NachrufInput - Reusable component for memorial obituary/nachruf input
 *
 * Used in:
 * - Memorial management page (/gedenkseite/[id]/verwalten/spruch-nachruf)
 * - Memorial creation wizard (future)
 *
 * Features:
 * - Max 5,000 characters
 * - Auto-growing textarea
 * - Character counter always visible
 * - OnBlur auto-save (when onSave prop provided)
 * - 5 states: default, hover, active, filled, complete
 */
export const NachrufInput: React.FC<NachrufInputProps> = ({
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
          <h3 className="text-webapp-body text-primary">Nachruf</h3>
          <p className="text-body-m text-secondary">
            Mit dem Nachruf hast du die Möglichkeit eine Würdigung des Lebens und der Leistungen zu hinterlassen.
          </p>
        </div>
      )}
      <TextArea
        label=""
        placeholder="Schreibe etwas..."
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        maxLength={MAX_NACHRUF_LENGTH}
        showCharacterCount
        showClearButton={false}
        autoGrow
        minRows={3}
        maxRows={20}
        disabled={disabled}
        error={error}
      />
    </div>
  );
};
