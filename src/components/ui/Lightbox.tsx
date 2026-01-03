'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeable } from 'react-swipeable';
import { cn } from '@/lib/utils';
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
 * Bildansicht mit:
 * - Desktop: 95% Modal mit Blur-Hintergrund und Border
 * - Mobile/Tablet: Fullscreen mit Swipe-Navigation
 * - Autoplay mit Play/Pause Toggle und Progress-Animation
 * - Manuell vor/zurück (Pfeile + Keyboard + Swipe)
 * - Schließbar: X-Button + Klick außerhalb + ESC-Taste
 * - Pagination Dots mit Progress-Indikator
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
  // Key to restart animation when image changes or play state changes
  const [animationKey, setAnimationKey] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

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
    setAnimationKey((prev) => prev + 1);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setAnimationKey((prev) => prev + 1);
  }, [images.length]);

  // Swipe handlers for touch devices
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

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
          setAnimationKey((prev) => prev + 1);
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

  // Handle click outside modal (desktop only)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handlePlayPauseToggle = () => {
    setIsPlaying((prev) => !prev);
    setAnimationKey((prev) => prev + 1);
  };

  if (!isOpen || !mounted || images.length === 0) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop - different for mobile vs desktop */}
      <div className="absolute inset-0 bg-black/90 md:bg-black/70" />

      {/* Content Container */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 flex flex-col',
          // Mobile/Tablet: Fullscreen
          'w-full h-full gap-1',
          // Desktop: Modal with styled container
          'md:w-[95%] md:max-w-8xl md:h-[97vh]',
          'md:border md:border-card-inverted md:bg-bw-opacity-60 md:backdrop-blur-md md:rounded-lg md:p-2'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-1">
          {/* User Info */}
          <div className="flex items-center gap-3">
            {(userName || userAvatar) && (
              <>
                <InitialsAvatar
                  name={userName || 'Unbekannt'}
                  imageUrl={userAvatar}
                  size="sm"
                />
                <span className="text-body-m text-white md:text-primary font-medium">
                  {userName || 'Unbekannt'}
                </span>
              </>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-secondary hover:bg-tertiary rounded-full transition-opacity"
            aria-label="Schließen"
          >
            <XIcon variant="sm" className="text-primary" />
          </button>
        </div>

        {/* Main Image Area */}
        <div
          {...swipeHandlers}
          className="flex-1 flex items-center justify-center relative min-h-0 overflow-hidden"
        >
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].alt || `Bild ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-sm select-none"
            draggable={false}
          />
        </div>

        {/* Pagination Dots with Progress Animation */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setCurrentIndex(index);
                  setAnimationKey((prev) => prev + 1);
                }}
                className={cn(
                  'h-2 rounded-full transition-all duration-200',
                  // Elongated only when playing AND active
                  index === currentIndex && isPlaying
                    ? 'w-10 relative overflow-hidden bg-secondary dark:bg-tertiary'
                    : index === currentIndex
                      ? 'w-2 bg-bw dark:bg-inverted'  // Active but paused: filled dot
                      : 'w-2 bg-secondary hover:bg-tertiary dark:bg-tertiary'  // Inactive dots
                )}
                aria-label={`Bild ${index + 1}`}
              >
                {/* Progress fill for active dot - only when playing */}
                {index === currentIndex && isPlaying && (
                  <span
                    key={animationKey}
                    className="absolute inset-y-0 left-0 bg-bw rounded-full dark:bg-inverted"
                    style={{
                      animation: `lightbox-progress ${autoplayInterval}ms linear forwards`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Control Container */}
        {images.length > 1 && (
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center gap-4 bg-bw-opacity-40 backdrop-blur-md w-full rounded-md p-2">
              {/* Previous Button - Outline Style */}
              <button
                type="button"
                onClick={goToPrevious}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-colors hover:bg-tertiary"
                aria-label="Vorheriges Bild"
              >
                <ChevronLeftIcon size={24} className="text-primary" />
              </button>

              {/* Play/Pause Button - Icon Only */}
              <button
                type="button"
                onClick={handlePlayPauseToggle}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  isPlaying
                    ? 'bg-button-secondary-default text-inverted-primary hover:bg-button-secondary-hover'
                    : 'bg-interactive-primary-active text-interactive-active hover:bg-interactive-primary-hover'
                )}
                aria-label={isPlaying ? 'Pause' : 'Abspielen'}
              >
                {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
              </button>

              {/* Next Button - Outline Style */}
              <button
                type="button"
                onClick={goToNext}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-colors hover:bg-tertiary"
                aria-label="Nächstes Bild"
              >
                <ChevronRightIcon size={24} className="text-primary" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
