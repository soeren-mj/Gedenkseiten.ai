'use client';

import { useRef, useEffect, useCallback } from 'react';
import { CoverType, TextColor } from '@/lib/supabase';
import { getCoverBackgroundStyle } from '@/lib/condolence-utils';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import TextColorIcon from '@/components/icons/TextColorIcon';

interface CoverPreviewProps {
  coverType: CoverType | null;
  coverValue: string;
  title: string;
  textColor: TextColor;
  showProfile: boolean;
  memorialData: {
    firstName: string;
    lastName?: string | null;
    avatarUrl?: string | null;
    avatarType?: 'initials' | 'image';
  };
  isEditing?: boolean;
  onTitleChange?: (title: string) => void;
  onToggleTextColor?: () => void;
  className?: string;
}

/**
 * Cover Preview Component
 *
 * Displays a live preview of the condolence book cover.
 * Used in both the cover editor and management view.
 * Aspect ratio is 2:3 (portrait orientation like a book).
 * Size range: 340x510 (min) to 400x600 (max)
 */
export function CoverPreview({
  coverType,
  coverValue,
  title,
  textColor,
  showProfile,
  memorialData,
  isEditing = false,
  onTitleChange,
  onToggleTextColor,
  className = '',
}: CoverPreviewProps) {
  const hasBackground = coverType && coverValue;
  const backgroundStyle = hasBackground
    ? getCoverBackgroundStyle(coverType, coverValue)
    : {};

  const textColorClass = textColor === 'white' ? 'text-white' : 'text-black';
  // Icon zeigt die nächste Farbe (invertiert)
  const iconColorClass = textColor === 'white' ? 'text-black' : 'text-white';

  // Auto-resize textarea ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize function
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  // Adjust height on title change
  useEffect(() => {
    adjustTextareaHeight();
  }, [title, adjustTextareaHeight]);

  return (
    <div
      className={`relative aspect-[2/3] w-[280px] sm:w-[300px] md:w-[350px] lg:max-w-[400px] rounded-md overflow-hidden ${className}`}
      style={backgroundStyle}
    >
      {/* Empty State - Dashed Border with editable title */}
      {!hasBackground && (
        <div className="absolute inset-0 border-2 border-dashed border-interactive-default rounded-md flex flex-col items-center justify-center bg-primary p-6">
          {isEditing && onTitleChange ? (
            <textarea
              ref={textareaRef}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Titel des Kondolenzbuch"
              className={`w-full text-webapp-subsection text-center bg-transparent border-none outline-none resize-none overflow-hidden
                ${title ? 'text-primary' : 'text-interactive-disabled'}
                placeholder:text-interactive-disabled placeholder:text-center
                focus:placeholder:text-transparent
                caret-[var(--text-interactive-primary-default)]`}
              rows={1}
              maxLength={150}
            />
          ) : (
            <span className="text-body-m text-secondary text-center px-4">
              {title || 'Titel des Kondolenzbuch'}
            </span>
          )}
        </div>
      )}

      {/* Content Overlay */}
      {hasBackground && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-4">
          {/* Text Color Toggle Button */}
          {isEditing && onToggleTextColor && (
            <button
              type="button"
              onClick={onToggleTextColor}
              title="Textfarbe wechseln"
            >
              <TextColorIcon size={32} className={iconColorClass} />
            </button>
          )}

          {/* Title */}
          <div className="flex items-center justify-center w-full">
            {isEditing && onTitleChange ? (
              <textarea
                ref={textareaRef}
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Titel des Kondolenzbuch"
                className={`w-full text-center text-xl font-medium bg-transparent border-none outline-none resize-none overflow-hidden ${textColorClass} placeholder:${textColorClass}/50`}
                rows={1}
                maxLength={150}
              />
            ) : (
              <p className={`text-xl font-medium text-center ${textColorClass}`}>
                {title}
              </p>
            )}
          </div>

          {/* Profile Section */}
          {showProfile && (
            <div className="flex flex-col items-center gap-2">
              <InitialsAvatar
                name={`${memorialData.firstName} ${memorialData.lastName || ''}`.trim()}
                imageUrl={memorialData.avatarUrl}
                size="md"
              />
              <span className={`text-sm ${textColorClass}`}>
                {memorialData.firstName}
                {memorialData.lastName ? ` ${memorialData.lastName}` : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
