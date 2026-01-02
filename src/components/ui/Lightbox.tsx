'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import PlayIcon from '@/components/icons/PlayIcon';
import PauseIcon from '@/components/icons/PauseIcon';
import { XIcon } from '@/components/icons/XIcon';
import InitialsAvatar from '@/components/ui/InitialsAvatar';

export interface LightboxImage {
  url: string;
  alt?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userAvatar?: string | null;
  autoplayInterval?: number;
}

/**
 * Lightbox Component
 *
 * Fullscreen Bildansicht mit:
 * - Autoplay mit Play/Pause Toggle
 * - Manuell vor/zurück (Pfeile + Keyboard)
 * - Schließbar: X-Button + Klick außerhalb + ESC-Taste
 * - Pagination Dots
 * - Header: Avatar + Name des Uploaders
 */
export function Lightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  userName,
  userAvatar,
  autoplayInterval = 5000,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Client-side only rendering for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPlaying(false);
    }
  }, [isOpen, initialIndex]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  // Autoplay
  useEffect(() => {
    if (!isOpen || !isPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, autoplayInterval, goToNext, images.length]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted || images.length === 0) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            {(userName || userAvatar) && (
              <>
                <InitialsAvatar
                  name={userName || 'Unbekannt'}
                  imageUrl={userAvatar}
                  size="sm"
                />
                <span className="text-body-m text-white font-medium">
                  {userName || 'Unbekannt'}
                </span>
              </>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Schließen"
          >
            <XIcon variant="sm" className="text-white" />
          </button>
        </div>

        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center px-4 relative min-h-0">
          {/* Previous Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
              aria-label="Vorheriges Bild"
            >
              <ChevronLeftIcon size={28} className="text-white" />
            </button>
          )}

          {/* Image */}
          <div className="max-w-full max-h-full flex items-center justify-center">
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || `Bild ${currentIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-sm"
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
              aria-label="Nächstes Bild"
            >
              <ChevronRightIcon size={28} className="text-white" />
            </button>
          )}
        </div>

        {/* Footer: Autoplay + Dots */}
        <div className="flex flex-col items-center gap-4 p-4">
          {/* Autoplay Controls */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isPlaying ? (
                <>
                  <PauseIcon size={16} className="text-white" />
                  <span className="text-body-s text-white">Pause</span>
                </>
              ) : (
                <>
                  <PlayIcon size={16} className="text-white" />
                  <span className="text-body-s text-white">Abspielen</span>
                </>
              )}
            </button>
          )}

          {/* Pagination Dots */}
          {images.length > 1 && (
            <div className="flex items-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-white'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Bild ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image Counter */}
          <div className="text-body-xs text-white/60">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
