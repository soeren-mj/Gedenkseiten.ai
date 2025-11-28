import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { XIcon } from '@/components/icons/XIcon';

export type TextAreaState = 'default' | 'hover' | 'active' | 'filled' | 'complete' | 'error';

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  showLabel?: boolean;
  hint?: string;
  error?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  showClearButton?: boolean;
  minRows?: number;
  maxRows?: number;
  autoGrow?: boolean;
  state?: TextAreaState;
  onChange?: (value: string) => void;
  onClear?: () => void;
  onBlur?: (value: string) => void;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  showLabel = true,
  placeholder,
  value: propValue,
  onChange,
  onClear,
  onBlur,
  hint,
  error,
  maxLength,
  showCharacterCount = false,
  showClearButton = true,
  minRows = 3,
  maxRows = 10,
  autoGrow = false,
  state: propState,
  disabled,
  className,
  id,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use prop value if controlled, otherwise use internal state
  const value = propValue !== undefined ? String(propValue) : internalValue;

  // Determine state based on focus, value, and prop state
  const computedState = (): TextAreaState => {
    if (propState) return propState;
    if (error) return 'error';
    if (isFocused && value) return 'filled';
    if (isFocused) return 'active';
    if (value) return 'complete';
    return 'default';
  };

  const state = computedState();

  // Auto-generate ID if not provided
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;

  // Auto-grow functionality
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoGrow) return;

    // Reset height to calculate proper scrollHeight
    textarea.style.height = 'auto';

    // Calculate line height (approximate)
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;

    // Set new height within bounds
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [autoGrow, minRows, maxRows]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // Enforce maxLength
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    if (propValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(value);
    props.onBlur?.(e);
  };

  const handleClear = () => {
    if (propValue === undefined) {
      setInternalValue('');
    }
    onChange?.('');
    onClear?.();
    textareaRef.current?.focus();
  };

  // State-based classes
  const getStateClasses = () => {
    const baseClasses = 'border transition-all duration-200';

    switch (state) {
      case 'error':
        return `${baseClasses} border-message-error bg-error-message`;
      case 'complete':
        // Complete state: bg-bw-opacity-40, border-main, text-secondary
        return `${baseClasses} border-main bg-bw-opacity-40`;
      case 'filled':
      case 'active':
        return `${baseClasses} border-active bg-bw`;
      default:
        return `${baseClasses} border-main bg-bw hover:border-hover focus-within:border-active`;
    }
  };

  // Container classes
  const containerClasses = cn(
    'relative flex gap-1 rounded-xs p-3',
    getStateClasses(),
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  // Textarea classes
  const textareaClasses = cn(
    'flex-1 bg-transparent outline-none text-body-s resize-none',
    state === 'complete' ? 'text-secondary' : 'text-primary',
    'placeholder:text-interactive-disabled',
    'disabled:cursor-not-allowed'
  );

  // Icon classes
  const iconClasses = 'w-5 h-5 text-primary flex-shrink-0';

  // Label classes
  const labelClasses = 'block text-body-s-semibold mb-1 px-2 text-primary';

  // Character count display
  const currentLength = value.length;
  const characterCountText = maxLength
    ? `${currentLength.toLocaleString('de-DE')}/${maxLength.toLocaleString('de-DE')} Zeichen`
    : `${currentLength.toLocaleString('de-DE')} Zeichen`;

  // Hint/Error text classes
  const hintClasses = cn(
    'mt-1 px-1 text-body-xs',
    error ? 'text-message-error' : 'text-secondary'
  );

  // Show clear button only when focused and has value (not in complete state)
  const shouldShowClearButton = showClearButton && value && !disabled && state !== 'complete';

  // Calculate rows for non-autoGrow mode
  const rows = autoGrow ? minRows : minRows;

  return (
    <div className="w-full">
      {label && showLabel && (
        <label htmlFor={textareaId} className={labelClasses}>
          {label}
        </label>
      )}

      <div className={containerClasses}>
        <textarea
          ref={textareaRef}
          id={textareaId}
          className={textareaClasses}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          aria-label={!showLabel ? label : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          aria-invalid={state === 'error'}
          {...props}
        />

        {shouldShowClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 rounded hover:bg-secondary transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-neutral-500 self-start mt-0.5"
            aria-label="Eingabe löschen"
          >
            <XIcon variant="sm" className={iconClasses} />
          </button>
        )}
      </div>

      {/* Hint/Error and Character Count Row */}
      <div className="flex justify-between items-start mt-1 px-1">
        {(error || hint) && (
          <p id={error ? errorId : hintId} className={hintClasses}>
            {error || hint}
          </p>
        )}
        {showCharacterCount && (
          <span className={cn(
            'text-body-xs text-secondary ml-auto',
            maxLength && currentLength >= maxLength && 'text-message-error'
          )}>
            {characterCountText}
          </span>
        )}
      </div>
    </div>
  );
};
