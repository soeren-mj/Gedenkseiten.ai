'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';
import ChangeIcon from '@/components/icons/ChangeIcon';
import { XIcon } from '@/components/icons/XIcon';
import { Button } from '@/components/ui/Button';

export interface GalleryImage {
  id?: string;
  url: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  editMode?: boolean;
  onDeleteImage?: (index: number) => void;
  onMoveImage?: (fromIndex: number, direction: 'left' | 'right') => void;
  onChangeImage?: (index: number) => void;
  onImageClick?: (index: number) => void;
  onPreviewChange?: (isOpen: boolean) => void;
}

// Portal-based Tooltip Component
interface PortalTooltipProps {
  text: string;
  show: boolean;
  targetRef: React.RefObject<HTMLButtonElement | null>;
}

function PortalTooltip({ text, show, targetRef }: PortalTooltipProps): ReactNode {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (show && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 36,
        left: rect.left + rect.width / 2,
      });
    }
  }, [show, targetRef]);

  if (!mounted || !show) return null;

  return createPortal(
    <div
      className="fixed z-[100] px-3 py-1.5 bg-bw text-primary text-body-xs rounded-xs shadow-lg -translate-x-1/2 pointer-events-none whitespace-nowrap"
      style={{ top: position.top, left: position.left }}
    >
      {text}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-bw rotate-45" />
    </div>,
    document.body
  );
}

/**
 * ImageGallery Component
 *
 * Wiederverwendbare Komponente für Bild-Thumbnails + Preview.
 *
 * Features:
 * - Thumbnail-Grid: 5 Bilder mit calc()-Breite, "+X" für mehr
 * - Preview-Modus: Hochkant-Bild mit Control-Bar
 * - Navigation: Chevrons mit justify-between Layout
 * - Sortieren (nur editMode): 3-spaltig mit Text in Mitte
 * - Löschen/Austauschen: Icons in Control-Bar Mitte
 * - Slide-Animation beim Bildwechsel
 * - Portal-basierte Tooltips
 */
export function ImageGallery({
  images,
  editMode = false,
  onDeleteImage,
  onMoveImage,
  onChangeImage,
  onImageClick,
  onPreviewChange,
}: ImageGalleryProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ref for outside click detection
  const previewRef = useRef<HTMLDivElement>(null);

  // Refs for tooltip positioning
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);

  // Tooltip states
  const [showPrevTooltip, setShowPrevTooltip] = useState(false);
  const [showNextTooltip, setShowNextTooltip] = useState(false);
  const [showDeleteTooltip, setShowDeleteTooltip] = useState(false);
  const [showChangeTooltip, setShowChangeTooltip] = useState(false);

  // Helper to set preview and notify parent
  const updatePreviewOpen = (isOpen: boolean) => {
    setPreviewOpen(isOpen);
    onPreviewChange?.(isOpen);
  };

  // Outside click detection
  useEffect(() => {
    if (!previewOpen || !editMode) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        updatePreviewOpen(false);
      }
    };

    // Delay adding listener to prevent immediate close from thumbnail click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [previewOpen, editMode]);

  if (images.length === 0) return null;

  // Thumbnails: Max 5 anzeigen, dann "+X"
  const maxThumbnails = 5;
  const displayThumbnails = images.slice(0, maxThumbnails);
  const remainingCount = images.length - maxThumbnails;

  const handleThumbnailClick = (index: number) => {
    if (editMode) {
      setCurrentIndex(index);
      updatePreviewOpen(true);
    } else {
      onImageClick?.(index);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleMoveLeft = () => {
    if (currentIndex > 0) {
      onMoveImage?.(currentIndex, 'left');
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMoveRight = () => {
    if (currentIndex < images.length - 1) {
      onMoveImage?.(currentIndex, 'right');
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDelete = () => {
    onDeleteImage?.(currentIndex);
    if (currentIndex >= images.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    if (images.length <= 1) {
      updatePreviewOpen(false);
    }
  };

  const handleChange = () => {
    onChangeImage?.(currentIndex);
  };

  const handleClose = () => {
    updatePreviewOpen(false);
  };

  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < images.length - 1;

  return (
    <div className="w-full">
      {/* Preview Mode (Edit-Mode only) */}
      {previewOpen && editMode && (
        <div ref={previewRef} className="relative mb-3 pt-3">
          {/* Close Button - mit Padding oben für Platz */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-0 right-0 p-1 rounded-full bg-bw shadow-md hover:bg-tertiary transition-colors z-20"
            aria-label="Schließen"
          >
            <XIcon variant="sm" className="text-primary w-6 h-6" />
          </button>

          {/* Bilder-Container mit angeschnittenen Bildern links und rechts */}
          <div className="flex items-stretch gap-2 overflow-hidden">
            {/* Vorheriges Bild angeschnitten (links) - zeigt rechten Rand */}
            {currentIndex > 0 && (
              <div className="flex-shrink-0 w-[6px] rounded-r-sm overflow-hidden">
                <div className="h-full aspect-[3/4] -translate-x-[calc(100%-6px)]">
                  <img
                    src={images[currentIndex - 1].url}
                    alt={`Bild ${currentIndex}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Hauptbild mit Slide-Animation */}
            <div className="relative flex-1 overflow-hidden rounded-xs">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="flex-shrink-0 w-full aspect-[3/4]"
                  >
                    <img
                      src={img.url}
                      alt={`Bild ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* Control-Bar im Bild unten - justify-between */}
              {/* Neue Anordnung: Delete links | Navigation mitte | Change rechts */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                {/* Links: Delete */}
                <button
                  ref={deleteButtonRef}
                  type="button"
                  onClick={handleDelete}
                  onMouseEnter={() => setShowDeleteTooltip(true)}
                  onMouseLeave={() => setShowDeleteTooltip(false)}
                  className="p-1.5 rounded-full bg-interactive-error-default hover:opacity-90 transition-opacity shadow-lg"
                  aria-label="Bild löschen"
                >
                  <DeleteIcon size={24} className="text-interactive-error-default" />
                </button>
                <PortalTooltip
                  text="Löschen"
                  show={showDeleteTooltip}
                  targetRef={deleteButtonRef}
                />

                {/* Mitte: Navigation (Previous + Next) */}
                <div className="flex items-center gap-3 bg-bw-opacity-40 backdrop-blur-sm rounded-full p-0.5 shadow-lg">
                  <button
                    ref={prevButtonRef}
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    onMouseEnter={() => setShowPrevTooltip(true)}
                    onMouseLeave={() => setShowPrevTooltip(false)}
                    className="p-2 rounded-full bg-bw-opacity-60 hover:bg-bw-opacity-80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Vorheriges Bild"
                  >
                    <ChevronLeftIcon size={24} className="text-primary" />
                  </button>
                  <PortalTooltip
                    text="Vorheriges"
                    show={showPrevTooltip && currentIndex > 0}
                    targetRef={prevButtonRef}
                  />

                  <button
                    ref={nextButtonRef}
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex === images.length - 1}
                    onMouseEnter={() => setShowNextTooltip(true)}
                    onMouseLeave={() => setShowNextTooltip(false)}
                    className="p-2 rounded-full bg-bw-opacity-60 hover:bg-bw-opacity-80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Nächstes Bild"
                  >
                    <ChevronRightIcon size={24} className="text-primary" />
                  </button>
                  <PortalTooltip
                    text="Nächstes"
                    show={showNextTooltip && currentIndex < images.length - 1}
                    targetRef={nextButtonRef}
                  />
                </div>

                {/* Rechts: Change */}
                {onChangeImage ? (
                  <>
                    <button
                      ref={changeButtonRef}
                      type="button"
                      onClick={handleChange}
                      onMouseEnter={() => setShowChangeTooltip(true)}
                      onMouseLeave={() => setShowChangeTooltip(false)}
                      className="p-1.5 rounded-full bg-inverted-opacity-80 backdrop-blur-sm shadow-lg hover:bg-inverted transition-colors"
                      aria-label="Bild austauschen"
                    >
                      <ChangeIcon size={24} className="text-inverted-primary" />
                    </button>
                    <PortalTooltip
                      text="Austauschen"
                      show={showChangeTooltip}
                      targetRef={changeButtonRef}
                    />
                  </>
                ) : (
                  <div className="w-11" /> // Placeholder für Layout-Balance
                )}
              </div>
            </div>

            {/* Nächstes Bild angeschnitten (rechts) - zeigt linken Rand */}
            {currentIndex < images.length - 1 && (
              <div className="flex-shrink-0 w-[6px] rounded-l-sm overflow-hidden">
                <div className="h-full aspect-[3/4]">
                  <img
                    src={images[currentIndex + 1].url}
                    alt={`Bild ${currentIndex + 2}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Verschieben-Bar 3-spaltig mit Button-Komponente */}
          <div className="flex items-center justify-between mt-2">
            {/* Links: nach links */}
            <Button
              variant="text"
              size="xs"
              leftIcon={<ChevronLeftIcon size={20} />}
              onClick={handleMoveLeft}
              disabled={!canMoveLeft}
            >
              nach links
            </Button>

            {/* Mitte: Text */}
            <span className="text-body-xs text-secondary">
              Bild {currentIndex + 1} verschieben
            </span>

            {/* Rechts: nach rechts */}
            <Button
              variant="text"
              size="xs"
              rightIcon={<ChevronRightIcon size={20} />}
              onClick={handleMoveRight}
              disabled={!canMoveRight}
            >
              nach rechts
            </Button>
          </div>
        </div>
      )}

      {/* Thumbnail Grid */}
      {(!previewOpen || !editMode) && (
        <div className="flex gap-2">
          {displayThumbnails.map((img, index) => (
            <button
              key={img.id || index}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className="relative w-[calc((100%-32px)/5)] aspect-square rounded-xs overflow-hidden bg-secondary flex-shrink-0"
            >
              <img
                src={img.url}
                alt={`Bild ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}

          {/* "+X" Button für weitere Bilder */}
          {remainingCount > 0 && (
            <button
              type="button"
              onClick={() => handleThumbnailClick(maxThumbnails)}
              className="relative w-[calc((100%-32px)/5)] aspect-square rounded-xs overflow-hidden bg-secondary border border-card flex items-center justify-center flex-shrink-0"
            >
              <span className="text-body-s text-interactive-primary-default font-medium">
                +{remainingCount}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
