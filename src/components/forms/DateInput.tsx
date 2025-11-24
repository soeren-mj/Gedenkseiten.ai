'use client';

import React, { forwardRef, useState } from 'react';
import { autoCorrectGermanDate, isValidGermanDate } from '@/lib/utils/date-validation';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

/**
 * DateInput Component
 *
 * Handles German date format (DD.MM.YYYY) with auto-correction and validation
 *
 * Features:
 * - Placeholder: "TT.MM.JJJJ"
 * - Auto-corrects common errors (e.g., "1.1.2024" → "01.01.2024")
 * - Live validation
 * - Error states
 * - Integration with react-hook-form
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, hint, required, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);

      // Auto-correct on blur
      if (e.target.value) {
        const corrected = autoCorrectGermanDate(e.target.value);
        e.target.value = corrected;

        // Validate
        if (!isValidGermanDate(corrected)) {
          setLocalError('Ungültiges Datum (TT.MM.JJJJ)');
        } else {
          setLocalError(null);
        }
      }

      // Call original onBlur if provided
      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setLocalError(null);
      props.onFocus?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Clear local error on change
      setLocalError(null);
      props.onChange?.(e);
    };

    const displayError = error || localError;
    const hasError = !!displayError;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-body-s font-medium text-primary mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type="text"
            placeholder="TT.MM.JJJJ"
            maxLength={10}
            autoComplete="off"
            onBlur={handleBlur}
            onFocus={handleFocus}
            onChange={handleChange}
            className={`
              w-full px-4 py-3
              text-body-m text-primary
              bg-bw border border-main rounded-md
              transition-all duration-200
              placeholder:text-tertiary

              ${isFocused ? 'border-interactive-primary-default ring-2 ring-interactive-primary-default/20' : ''}
              ${hasError ? 'border-red-500 ring-2 ring-red-500/20' : ''}

              hover:border-interactive-primary-hover
              focus:outline-none
              focus:border-interactive-primary-default
              focus:ring-2
              focus:ring-interactive-primary-default/20

              disabled:bg-tertiary
              disabled:text-tertiary
              disabled:cursor-not-allowed
              disabled:border-main

              ${className}
            `}
            {...props}
          />
        </div>

        {/* Hint or Error Message */}
        {(hint || displayError) && (
          <p className={`mt-2 text-body-s ${hasError ? 'text-red-500' : 'text-secondary'}`}>
            {displayError || hint}
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
