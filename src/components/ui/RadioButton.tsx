'use client';

import React from 'react';

interface RadioButtonProps {
  checked: boolean;
  disabled?: boolean;
  onChange?: () => void;
  name?: string;
  className?: string;
}

/**
 * RadioButton Component
 *
 * A custom radio button with three states:
 * - Checked: Green radial gradient with white inner dot
 * - Default: White background with gray border
 * - Disabled: Grayed out, not clickable
 *
 * Design based on Figma specs with exact gradients:
 * - Outer: #6CDC95 (green-400) → #1E9B4C (green-600) @ 67.5%
 * - Inner dot: white → #D2D3D9 (neutral-200) @ 80-100%
 */
export function RadioButton({
  checked,
  disabled = false,
  onChange,
  name,
  className = ''
}: RadioButtonProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange();
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      name={name}
      className={`
        flex-shrink-0
        ${disabled ? 'cursor-not-allowed opacity-20' : 'cursor-pointer'}
        ${className}
      `}
    >
      {checked ? (
        // Checked State - Radial gradient with inner dot
        <div
          className="w-6 h-6 rounded-full relative flex items-center justify-center transition-all"
          style={{
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, #6CDC95 0%, #1E9B4C 67.5%)',
          }}
        >
          {/* Inner white dot with gradient */}
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: 'radial-gradient(ellipse 50% 50% at 50% 50%, white 80%, #D2D3D9 100%)',
            }}
          />
        </div>
      ) : (
        // Unchecked State - Border only
        <div className="w-6 h-6 rounded-full border-[0.094rem] border-interactive-default transition-all hover:border-hover" />
      )}
    </button>
  );
}
