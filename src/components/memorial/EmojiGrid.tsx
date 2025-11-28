'use client';

/**
 * EmojiGrid Component
 *
 * A grid of emojis for selecting an emoji for a wissenswertes entry.
 * 29 emojis in 2 rows as specified in the design.
 */

const EMOJI_LIST = [
  // Row 1
  '💼', '👩‍🏫', '👨‍⚕️', '🎓', '🏃', '⚽', '🏊', '🚴', '🏅', '🎨', '🎵', '✍️', '📷', '🌳',
  // Row 2
  '🧑‍🌾', '🌻', '🏆', '🐕', '👵', '👨‍👩‍👧‍👦', '💜', '😂', '😊', '😄', '🤗', '💡', '🎁', '⭐', '✨'
];

interface EmojiGridProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiGrid({ selectedEmoji, onSelect, disabled = false }: EmojiGridProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {EMOJI_LIST.map((emoji) => {
        const isSelected = selectedEmoji === emoji;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => !disabled && onSelect(emoji)}
            disabled={disabled}
            className={`
              w-8 h-8 flex items-center justify-center text-xl
              rounded-xxs transition-all duration-150
              ${isSelected
                ? 'border-2 border-interactive-default bg-bw'
                : 'border border-transparent hover:bg-bw-opacity-40'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={`Emoji ${emoji} auswählen`}
            aria-pressed={isSelected}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}

export { EMOJI_LIST };
