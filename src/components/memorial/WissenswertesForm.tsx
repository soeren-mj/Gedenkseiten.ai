'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { EmojiGrid } from '@/components/memorial/EmojiGrid';

const MAX_TEXT_LENGTH = 60;
const DEFAULT_EMOJI = '⭐';

interface WissenswertesFormProps {
  initialEmoji?: string;
  initialText?: string;
  onSave: (emoji: string, text: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * WissenswertesForm Component
 *
 * Layout:
 * [Emoji-Preview] [Input-Feld........................]
 *                                             60 / 60
 *
 * [Emoji-Grid....................................]
 *
 *           [Abbrechen] [Speichern]
 */
export function WissenswertesForm({
  initialEmoji = DEFAULT_EMOJI,
  initialText = '',
  onSave,
  onCancel,
  isLoading = false,
}: WissenswertesFormProps) {
  const [emoji, setEmoji] = useState(initialEmoji);
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length === 0 || isLoading) return;
    await onSave(emoji, text.trim());
  };

  const canSave = text.trim().length > 0 && text.length <= MAX_TEXT_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-bw-opacity-40 border border-card rounded-md p-2 gap-2">
      {/* Input row: Emoji preview + Text input */}
      <div className="flex items-center gap-1">
        {/* Emoji Preview */}
        <div className="w-10 h-10 flex items-center justify-center text-xl bg-bw-opacity-80 rounded-xs border border-main">
          {emoji}
        </div>

        {/* Text Input */}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
            placeholder="Schreibe etwas..."
            disabled={isLoading}
            className={`
              w-full px-3 py-2 text-body-m text-primary
              bg-bw-opacity-80 border border-main rounded-xs
              placeholder:text-tertiary
              focus:outline-none focus:border-active
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            maxLength={MAX_TEXT_LENGTH}
          />
        </div>
      </div>

      {/* Character Counter - right aligned under input */}
      <div className="flex flex-row items-start pl-4 pr-2">
      {/* Emoji Grid */}
      <div className="mb-6 w-full">
        <EmojiGrid
          selectedEmoji={emoji}
          onSelect={setEmoji}
          disabled={isLoading}
        />
      </div>

      <div className="max-w-40 min-w-16 flex justify-end">
        <span className={`text-body-s ${text.length >= MAX_TEXT_LENGTH ? 'text-error' : 'text-tertiary'}`}>
          {text.length} / {MAX_TEXT_LENGTH}
        </span>
      </div>
      </div>

      {/* Buttons - centered */}
      <div className="flex justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!canSave || isLoading}
          loading={isLoading}
        >
          Speichern
        </Button>
      </div>
    </form>
  );
}
