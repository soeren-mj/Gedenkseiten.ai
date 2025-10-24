import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { XIcon } from '@/components/icons/XIcon';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  size?: 'md' | 'sm';
  label?: string;
  showLabel?: boolean;
  leadingIcon?: 'search' | 'lock';
  showClearButton?: boolean;
  hint?: string;
  error?: string;
  state?: 'default' | 'hover' | 'active' | 'error' | 'done';
  onChange?: (value: string) => void;
  onClear?: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  size = 'md',
  label,
  showLabel = true,
  placeholder,
  value: propValue,
  onChange,
  onClear,
  leadingIcon,
  showClearButton = true,
  hint,
  error,
  state: propState,
  disabled,
  className,
  id,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use prop value if controlled, otherwise use internal state
  const value = propValue !== undefined ? propValue : internalValue;
  const state = propState || (error ? 'error' : 'default');
  
  // Auto-generate ID if not provided
  const inputId = id || `text-input-${Math.random().toString(36).substr(2, 9)}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (propValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = () => {
    if (propValue === undefined) {
      setInternalValue('');
    }
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  // Size classes
  const sizeClasses = {
    md: 'px-3 py-2',
    sm: 'px-3 py-1'
  };

  // State-based classes
  const getStateClasses = () => {
    const baseClasses = 'border transition-all duration-200';
    
    switch (state) {
      case 'error':
        return `${baseClasses} border-[var(--text-error-message)] bg-error-message`;
      case 'done':
        return `${baseClasses} border-main bg-bw-opacity-40`;
      default:
        return `${baseClasses} border-main bg-bw hover:border-hover focus-within:border-active`;
    }
  };

  // Container classes
  const containerClasses = cn(
    'relative flex items-center gap-1 rounded-xs', // gap-1 (4px), rounded-xs (12px)
    sizeClasses[size],
    getStateClasses(),
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  // Input classes
  const inputClasses = cn(
    'flex-1 bg-transparent outline-none text-body-s', // Using text-body-s utility
    'text-primary placeholder:text-interactive-disabled',
    'disabled:cursor-not-allowed'
  );

  // Icon classes
  const iconClasses = 'w-5 h-5 text-primary';

  // Label classes using text-body-s-semibold
  const labelClasses = 'block text-body-s-semibold mb-1 px-1 text-primary';

  // Hint/Error text classes using text-body-xs
  const hintClasses = cn(
    'mt-1 px-1 text-body-xs',
    error 
      ? 'text-error-message' 
      : state === 'done' 
        ? 'text-secondary' 
        : 'text-secondary'
  );

  // Show clear button logic
  const shouldShowClearButton = showClearButton && value && !disabled;

  return (
    <div className="w-full">
      {label && showLabel && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className={containerClasses}>
        {leadingIcon === 'search' && (
          <SearchIcon variant="sm" className={iconClasses} />
        )}
        
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className={inputClasses}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={!showLabel ? label : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          aria-invalid={state === 'error'}
          {...props}
        />
        
        {shouldShowClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 rounded hover:bg-secondary transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            aria-label="Clear input"
          >
            <XIcon variant="sm" className={iconClasses} />
          </button>
        )}
      </div>
      
      {(error || hint) && (
        <p id={error ? errorId : hintId} className={hintClasses}>
          {error || hint}
        </p>
      )}
    </div>
  );
};