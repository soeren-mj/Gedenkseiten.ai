'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export interface InlineAutocompleteOption {
  value: string;
  label: string;
}

export interface InlineAutocompleteProps {
  options: InlineAutocompleteOption[];
  value?: string;
  onChange?: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  name?: string;
  isOpen?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

/**
 * InlineAutocomplete Component
 *
 * Similar to InlineDatePicker pattern - renders trigger button/input only.
 * Parent component must render the expanded list conditionally.
 *
 * Usage Pattern:
 *
 * // Row 1: Label + Trigger
 * <div className="flex items-center px-3 py-2 border-b">
 *   <label>Tierart</label>
 *   <InlineAutocomplete
 *     value={value}
 *     onChange={setValue}
 *     onOpenChange={setIsOpen}
 *     isOpen={isOpen}
 *   />
 * </div>
 *
 * // Row 2: Expanded List (conditional)
 * {isOpen && (
 *   <div className="px-3 py-3 border-b">
 *     <InlineAutocompleteList
 *       options={options}
 *       value={value}
 *       onChange={(v) => { setValue(v); setIsOpen(false); }}
 *       searchValue={searchValue}
 *       onSearchChange={setSearchValue}
 *     />
 *   </div>
 * )}
 */
export const InlineAutocomplete = forwardRef<HTMLInputElement, InlineAutocompleteProps>(
  (
    {
      options,
      value,
      onChange,
      onOpenChange,
      onClear,
      placeholder,
      disabled,
      loading,
      className = '',
      name,
      isOpen = false,
      searchValue = '',
      onSearchChange,
    },
    ref
  ) => {
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Find selected option label
    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = selectedOption?.label || '';

    // Focus search input when opening
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen]);

    // Reset search when closing
    useEffect(() => {
      if (!isOpen) {
        onSearchChange?.('');
      }
    }, [isOpen, onSearchChange]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onOpenChange?.(true);
      } else if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        onOpenChange?.(false);
      }
    };

    return (
      <>
        {/* Hidden input for form integration */}
        <input ref={ref} type="hidden" name={name} value={value || ''} />

        {/* Closed State: Trigger Button + Clear Button */}
        {!isOpen && (
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              data-inline-autocomplete-trigger="true"
              onClick={() => !disabled && !loading && onOpenChange?.(true)}
              onKeyDown={handleKeyDown}
              disabled={disabled || loading}
              className={`
                flex-1 text-right text-body-s
                ${displayValue ? 'text-primary' : 'text-tertiary'}
                ${disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                focus:outline-none
                ${className}
              `}
            >
              {loading ? 'Lädt...' : displayValue || placeholder}
            </button>

            {/* Clear Button - only shown when value is set */}
            {value && onClear && !disabled && !loading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="text-tertiary hover:text-primary transition-colors flex-shrink-0"
                aria-label="Clear selection"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Open State: Search Input */}
        {isOpen && (
          <div className="flex items-center gap-2 w-full">
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`
                flex-1 px-2 py-1 text-body-s text-primary text-right
                bg-transparent border-none outline-none
                placeholder:text-tertiary
                ${className}
              `}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="text-tertiary hover:text-primary transition-colors flex-shrink-0"
                aria-label="Clear search"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </>
    );
  }
);

InlineAutocomplete.displayName = 'InlineAutocomplete';

/**
 * InlineAutocompleteList Component
 *
 * Renders the scrollable options list - must be in separate row from trigger.
 */
interface InlineAutocompleteListProps {
  options: InlineAutocompleteOption[];
  value?: string;
  onChange: (value: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}

export const InlineAutocompleteList: React.FC<InlineAutocompleteListProps> = ({
  options,
  value,
  onChange,
  searchValue = '',
  onSearchChange,
  className = '',
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchValue, 300);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Auto-scroll to selected item on mount
  useEffect(() => {
    if (listRef.current && value) {
      const selectedElement = listRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []); // Only run on mount

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            onChange(filteredOptions[focusedIndex].value);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, filteredOptions, onChange]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  return (
    <div
      ref={listRef}
      className={`
        max-h-[300px] overflow-y-auto space-y-1
         rounded-xs bg-bw
        p-1
        ${className}
      `}
    >
      {filteredOptions.length === 0 ? (
        <div className="px-3 py-2 text-body-s text-tertiary text-center">
          Keine Ergebnisse gefunden
        </div>
      ) : (
        filteredOptions.map((option, index) => {
          const isSelected = option.value === value;
          const isFocused = index === focusedIndex;

          return (
            <button
              key={option.value}
              type="button"
              data-selected={isSelected}
              onClick={() => onChange(option.value)}
              className={`
                w-full text-center px-3 py-2 rounded-xxs text-body-s
                transition-colors
                ${
                  isSelected
                    ? 'bg-interactive-primary-default text-bw'
                    : isFocused
                    ? 'bg-primary text-primary'
                    : 'text-primary hover:bg-primary'
                }
              `}
            >
              {option.label}
            </button>
          );
        })
      )}
    </div>
  );
};
