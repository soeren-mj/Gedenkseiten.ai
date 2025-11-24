'use client';

import React, { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
  group?: string; // Optional group name for optgroup support
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * Select Component
 *
 * Custom dropdown with design system styling
 *
 * Features:
 * - Options array
 * - Grouped options (optgroup) support
 * - Placeholder support
 * - Error states
 * - Loading state (disabled)
 * - Integration with react-hook-form
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, placeholder, required, className = '', ...props }, ref) => {
    const hasError = !!error;
    const [internalValue, setInternalValue] = React.useState(props.value || '');

    // Sync internal state with external value changes (react-hook-form)
    React.useEffect(() => {
      if (props.value !== undefined) {
        setInternalValue(props.value);
      }
    }, [props.value]);

    // Group options by group name
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, SelectOption[]> = {};
      const ungrouped: SelectOption[] = [];

      options.forEach(option => {
        if (option.group) {
          if (!groups[option.group]) {
            groups[option.group] = [];
          }
          groups[option.group].push(option);
        } else {
          ungrouped.push(option);
        }
      });

      return { groups, ungrouped };
    }, [options]);

    return (
      <div className="flex items-center w-full">
        {label && (
          <label className="text-body-s text-primary w-40">
            {label}
            {required && <span className="text-accent-red ml-1">*</span>}
          </label>
        )}

        <div className="flex-1 flex gap-2 items-center justify-end relative">
          <select
            ref={ref}
            {...props}
            onChange={(e) => {
              setInternalValue(e.target.value);
              props.onChange?.(e);
            }}
            className={`
              text-right
              text-body-s ${internalValue && internalValue !== '' ? 'text-primary' : 'text-inverted-secondary'}
              bg-transparent pr-6
              transition-all duration-200
              appearance-none
              cursor-pointer

              ${hasError ? 'border-red-500 ring-2 ring-red-500/20' : ''}

              hover:border-interactive-primary-hover
              focus:outline-none
              focus:border-interactive-primary-default
              focus:ring-2
              focus:ring-interactive-primary-default/20

              disabled:bg-transparent
              disabled:text-inverted-secondary
              disabled:cursor-not-allowed
              disabled:border-main

              ${className}
            `}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {/* Render ungrouped options first */}
            {groupedOptions.ungrouped.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}

            {/* Render grouped options in optgroups */}
            {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
              <optgroup key={groupName} label={groupName}>
                {groupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Chevron Icon */}
          <div className="absolute right-0 pointer-events-none">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Hint or Error Message */}
        {(hint || error) && (
          <p className={`mt-2 text-body-s ${hasError ? 'text-red-500' : 'text-secondary'}`}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
