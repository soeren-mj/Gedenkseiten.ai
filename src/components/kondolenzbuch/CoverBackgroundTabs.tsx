'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CoverType, TextColor } from '@/lib/supabase';
import {
  COVER_COLORS,
  COVER_PRESETS,
  getDefaultTextColor,
  validateImageFile,
  getPresetFallbackGradient,
} from '@/lib/condolence-utils';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import ImageIcon from '@/components/icons/ImageIcon';
import PaletteIcon from '@/components/icons/PaletteIcon';
import PhotoChooseIcon from '@/components/icons/PhotoChooseIcon';

type ExpandedBar = 'none' | 'colors' | 'presets';

interface CoverBackgroundTabsProps {
  coverType: CoverType | null;
  coverValue: string;
  onSelect: (type: CoverType, value: string, suggestedTextColor: TextColor) => void;
  onImageUpload?: (file: File) => Promise<string | null>;
  isUploading?: boolean;
}

/**
 * Cover Background Tabs Component
 *
 * Expandable control for selecting cover background:
 * - Default: Shows upload button, color palette icon, preset icon
 * - Colors expanded: Shows color swatches, hides other elements
 * - Presets expanded: Shows preset thumbnails, hides other elements
 * - Auto-closes after 5 seconds of inactivity (pauses on hover)
 */
export function CoverBackgroundTabs({
  coverType,
  coverValue,
  onSelect,
  onImageUpload,
  isUploading = false,
}: CoverBackgroundTabsProps) {
  const [expandedBar, setExpandedBar] = useState<ExpandedBar>('none');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Timer functions
  const clearAutoCloseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoCloseTimer = useCallback(() => {
    clearAutoCloseTimer();
    timerRef.current = setTimeout(() => {
      setExpandedBar('none');
    }, 5000);
  }, [clearAutoCloseTimer]);

  // Start timer when bar expands
  useEffect(() => {
    if (expandedBar !== 'none') {
      startAutoCloseTimer();
    }
    return clearAutoCloseTimer;
  }, [expandedBar, startAutoCloseTimer, clearAutoCloseTimer]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      showToast('error', 'Fehler', validation.error || 'Ungültige Datei');
      return;
    }

    const imageUrl = await onImageUpload(file);
    if (imageUrl) {
      const suggestedTextColor = getDefaultTextColor('custom', imageUrl);
      onSelect('custom', imageUrl, suggestedTextColor);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleColorSelect = (hex: string) => {
    const suggestedTextColor = getDefaultTextColor('color', hex);
    onSelect('color', hex, suggestedTextColor);
    // Reset timer on selection
    startAutoCloseTimer();
  };

  const handlePresetSelect = (presetName: string) => {
    const suggestedTextColor = getDefaultTextColor('preset', presetName);
    onSelect('preset', presetName, suggestedTextColor);
    // Reset timer on selection
    startAutoCloseTimer();
  };

  const toggleBar = (bar: 'colors' | 'presets') => {
    setExpandedBar((current) => (current === bar ? 'none' : bar));
  };

  // Common styles for icon buttons
  const iconButtonClass =
    'p-1 rounded-full transition-all duration-300 hover:bg-tertiary';

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-[400px] px-5">
      <div className="flex items-center h-10 gap-3 justify-center">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Button - hidden when any bar is expanded */}
        <div
          className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
            expandedBar !== 'none' ? 'w-0' : ''
          }`}
        >
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<PhotoChooseIcon size={20} />}
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? 'Laden...' : coverType === 'custom' ? 'Hintergrundbild ändern' : 'Hintergrundbild wählen'}
          </Button>
        </div>

      {/* Colors Bar */}
      <div
        className={`flex items-center justify-between rounded-full transition-all duration-300 ease-out ${
          expandedBar === 'colors' ? 'w-full bg-secondary p-1' : ''
        } ${
          expandedBar === 'presets' ? 'w-0 overflow-hidden' : ''
        }`}
        onMouseEnter={() => expandedBar === 'colors' && clearAutoCloseTimer()}
        onMouseLeave={() => expandedBar === 'colors' && startAutoCloseTimer()}
      >
        <button
          type="button"
          onClick={() => toggleBar('colors')}
          className={iconButtonClass}
          title="Farbpalette"
        >
          <PaletteIcon size={24} />
        </button>

        {/* Color swatches - immer im DOM, Breite animiert */}
        <div
          className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ease-out ${
            expandedBar === 'colors' ? 'opacity-100' : 'w-0 opacity-0'
          }`}
        >
          {COVER_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => handleColorSelect(color.hex)}
              className={`w-7 h-7 flex-shrink-0 rounded-full border-2 border-active transition-all ${
                coverType === 'color' && coverValue === color.hex
                  ? 'border-interactive-primary-active'
                  : 'border-transparent hover:border-hover'
              } `}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Presets Bar */}
      <div
        className={`flex items-center justify-between rounded-full transition-all duration-300 ease-out ${
          expandedBar === 'presets' ? 'w-full bg-secondary p-1' : ''
        } ${
          expandedBar === 'colors' ? 'w-0 overflow-hidden' : ''
        }`}
        onMouseEnter={() => expandedBar === 'presets' && clearAutoCloseTimer()}
        onMouseLeave={() => expandedBar === 'presets' && startAutoCloseTimer()}
      >
        <button
          type="button"
          onClick={() => toggleBar('presets')}
          className={iconButtonClass}
          title="Vorlagen"
        >
          <ImageIcon size={24} />
        </button>

        {/* Preset thumbnails - immer im DOM, Breite animiert */}
        <div
          className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ease-out ${
            expandedBar === 'presets' ? 'opacity-100' : 'w-0 opacity-0'
          }`}
        >
          {COVER_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetSelect(preset.name)}
              className={`w-7 h-7 flex-shrink-0 rounded-full overflow-hidden border border-active transition-all ${
                coverType === 'preset' && coverValue === preset.name
                  ? 'border-interactive-primary-default scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              title={preset.label}
            >
              <div
                className="w-full h-full"
                style={{
                  background: getPresetFallbackGradient(preset.name),
                }}
              />
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
