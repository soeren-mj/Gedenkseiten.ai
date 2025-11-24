'use client';

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface AutocompleteOption {
  value: string | number;
  label: string;
}

interface AutocompleteProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  options: AutocompleteOption[];
  error?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  loading?: boolean;
  value?: string | number;
  onChange?: (value: string | number | null, option: AutocompleteOption | null) => void;
  onSearch?: (query: string) => void;
  noResultsText?: string;
}

/**
 * Autocomplete Component
 *
 * Autocomplete with typeahead functionality
 *
 * Features:
 * - Async data loading support
 * - Debounced search
 * - Keyboard navigation (Arrow up/down, Enter, Escape)
 * - Highlighting matched text
 * - "Keine Ergebnisse" state
 * - Integration with react-hook-form via onChange callback
 */
export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      label,
      options,
      error,
      hint,
      placeholder,
      required,
      loading = false,
      value,
      onChange,
      onSearch,
      noResultsText = 'Keine Ergebnisse',
      className = '',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [displayValue, setDisplayValue] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const debouncedSearch = useDebounce(searchQuery, 300);

    const hasError = !!error;

    // Filter options based on search query
    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Update display value when value prop changes
    useEffect(() => {
      if (value) {
        const selected = options.find((opt) => opt.value === value);
        if (selected) {
          setDisplayValue(selected.label);
        }
      } else {
        setDisplayValue('');
      }
    }, [value, options]);

    // Call onSearch when debounced search changes
    useEffect(() => {
      if (onSearch && debouncedSearch) {
        onSearch(debouncedSearch);
      }
    }, [debouncedSearch, onSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      setDisplayValue(query);
      setIsOpen(true);
      setSelectedIndex(-1);

      // If cleared, notify parent
      if (!query && onChange) {
        onChange(null, null);
      }
    };

    const handleOptionClick = (option: AutocompleteOption) => {
      setDisplayValue(option.label);
      setSearchQuery(option.label);
      setIsOpen(false);
      setSelectedIndex(-1);

      if (onChange) {
        onChange(option.value, option);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setIsOpen(true);
          return;
        }
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
            handleOptionClick(filteredOptions[selectedIndex]);
          }
          break;

        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    const highlightMatch = (text: string, query: string) => {
      if (!query) return text;

      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-900">
            {part}
          </mark>
        ) : (
          part
        )
      );
    };

    return (
      <div ref={containerRef} className="w-full relative">
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
            value={displayValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            className={`
              w-full px-4 py-3 pr-10
              text-body-m text-primary
              bg-bw border border-main rounded-md
              transition-all duration-200
              placeholder:text-tertiary

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

          {/* Chevron Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {loading ? (
              <svg className="w-5 h-5 text-secondary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className={`w-5 h-5 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-bw border border-main rounded-md shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="px-4 py-3 text-body-s text-secondary text-center">Laden...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-body-s text-secondary text-center">{noResultsText}</div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={`
                    w-full px-4 py-3 text-left text-body-m
                    transition-colors cursor-pointer
                    ${
                      index === selectedIndex
                        ? 'bg-interactive-primary-default/10 text-primary'
                        : 'text-primary hover:bg-tertiary'
                    }
                  `}
                >
                  {highlightMatch(option.label, searchQuery)}
                </button>
              ))
            )}
          </div>
        )}

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

Autocomplete.displayName = 'Autocomplete';
