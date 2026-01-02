'use client';

import { useState } from 'react';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import PenIcon from '@/components/icons/PenIcon';
import VisibilityOffIcon from '@/components/icons/VisibilityOffIcon';
import VisibilityIcon from '@/components/icons/VisibilityIcon';
import ReportIcon from '@/components/icons/ReportIcon';
import MoreVerticalIcon from '@/components/icons/MoreVerticalIcon';
import { Badge } from '@/components/ui/Badge';
import { ImageGallery, GalleryImage } from '@/components/ui/ImageGallery';
import { Lightbox } from '@/components/ui/Lightbox';
import { CondolenceEntryWithDetails } from '@/lib/supabase';

export interface UploadedImage {
  id?: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

interface EntryCardProps {
  // View mode props
  entry?: CondolenceEntryWithDetails;
  isOwn?: boolean;
  isAdmin?: boolean;
  isNew?: boolean;
  onEdit?: () => void;
  onHide?: () => void;
  onReport?: () => void;
  // Edit mode props
  editMode?: boolean;
  userName?: string;
  userAvatar?: string | null;
  content?: string;
  onContentChange?: (content: string) => void;
  images?: UploadedImage[];
  onDeleteImage?: (index: number) => void;
  onMoveImage?: (fromIndex: number, direction: 'left' | 'right') => void;
  onChangeImage?: (index: number) => void;
  maxChars?: number;
}

/**
 * Entry Card Component
 *
 * Displays a single condolence entry in the list.
 * Shows user info, content, optional image thumbnails, and action menu.
 *
 * Supports two modes:
 * - View mode (editMode=false): Shows entry content with action menu + Lightbox
 * - Edit mode (editMode=true): Shows editable textarea and ImageGallery with sorting
 *
 * Permissions (view mode only):
 * - Own entry: Edit + Hide/Show
 * - Admin on other's entry: Hide/Show + Report
 */
export function EntryCard({
  // View mode props
  entry,
  isOwn = false,
  isAdmin = false,
  isNew = false,
  onEdit,
  onHide,
  onReport,
  // Edit mode props
  editMode = false,
  userName: userNameProp,
  userAvatar: userAvatarProp,
  content: contentProp,
  onContentChange,
  images: imagesProp,
  onDeleteImage,
  onMoveImage,
  onChangeImage,
  maxChars = 2000,
}: EntryCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Determine values based on mode
  const isHidden = entry?.is_hidden ?? false;

  // Get user display info - from props in edit mode, from entry in view mode
  const userName = editMode
    ? userNameProp || 'Unbekannt'
    : typeof entry?.user === 'object' && entry?.user !== null
      ? entry.user.name || 'Unbekannt'
      : 'Unbekannt';
  const userAvatar = editMode
    ? userAvatarProp
    : typeof entry?.user === 'object' && entry?.user !== null
      ? entry.user.avatar_url
      : null;

  // Get content - from props in edit mode, from entry in view mode
  const content = editMode ? contentProp || '' : entry?.content || '';

  // Get images array - from props in edit mode, from entry in view mode
  const images: GalleryImage[] = editMode
    ? (imagesProp || []).map((img) => ({ id: img.id, url: img.url }))
    : Array.isArray(entry?.images)
      ? entry.images.map((img) => ({ id: img.id, url: img.image_url }))
      : [];

  // Menu visibility logic (view mode only)
  const canEdit = !editMode && isOwn && onEdit;
  const canHide = !editMode && (isOwn || isAdmin) && onHide;
  const canReport = !editMode && isAdmin && !isOwn && onReport;
  const canShowMenu = canEdit || canHide || canReport;

  // Edit mode handlers
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars && onContentChange) {
      onContentChange(value);
    }
  };

  // Lightbox handlers (view mode)
  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Edit mode: Same card styling as view mode, but with editable content
  if (editMode) {
    return (
      <div className="relative aspect-[2/3] h-full w-[280px] sm:w-[300px] md:w-[350px] lg:max-w-[400px] rounded-md overflow-hidden dark:border dark:border-main">
        <div className="absolute bg-bw inset-0 h-full p-2 flex flex-col gap-4 min-h-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3">
            <InitialsAvatar name={userName} imageUrl={userAvatar} size="sm" />
            <span className="text-body-m text-primary font-medium">
              {userName}
            </span>
          </div>

          {/* Content (Bilder + Textarea) */}
          <div className="flex-1 flex flex-col gap-3 px-1 min-h-0 overflow-hidden">
            {/* ImageGallery im Edit-Mode */}
            {images.length > 0 && (
              <ImageGallery
                images={images}
                editMode
                onDeleteImage={onDeleteImage}
                onMoveImage={onMoveImage}
                onChangeImage={onChangeImage}
                onPreviewChange={setIsPreviewOpen}
              />
            )}

            {/* Text Area - nur anzeigen wenn Preview geschlossen */}
            {!isPreviewOpen && (
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Schreibe etwas..."
                className="w-full flex-1 min-h-[100px] bg-transparent text-body-m text-primary placeholder:text-tertiary resize-none focus:outline-none"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // View mode: Original card design with Lightbox
  return (
    <>
      <div
        className={`relative aspect-[2/3] w-[280px] sm:w-[300px] md:w-[350px] lg:max-w-[400px] rounded-md overflow-hidden ${
          isHidden ? 'border border-accent-orange' : 'dark:border dark:border-main'
        }`}
      >
        <div className="absolute inset-0 bg-bw h-full p-2 flex flex-col gap-4 min-h-0 overflow-hidden">
          {/* Wrapper 1: Header */}
          <div className="flex items-center justify-between">
            {/* Links: Avatar + Name/Datum */}
            <div className="flex items-center gap-3">
              <InitialsAvatar name={userName} imageUrl={userAvatar} size="sm" />
              <div className="flex flex-col">
                <span className="text-body-m text-primary font-medium">
                  {userName}
                </span>
              </div>
            </div>

            {/* Rechts: Badge + Menu */}
            <div className="flex items-center gap-2">
              {isHidden ? (
                <Badge variant="orange">Verborgen</Badge>
              ) : (
                isNew && <Badge variant="blue">Neu</Badge>
              )}
              {canShowMenu && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-secondary rounded-xs transition-colors"
                    aria-label="Aktionen"
                  >
                    <MoreVerticalIcon size={20} className="text-secondary" bold />
                  </button>

                  {showMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      {/* Menu */}
                      <div className="absolute right-0 top-full mt-1 z-20 bg-primary border border-card rounded-sm shadow-lg min-w-[150px] overflow-hidden">
                        {/* Edit - only own entries */}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMenu(false);
                              onEdit?.();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-body-s text-primary hover:bg-secondary transition-colors"
                          >
                            <PenIcon size={16} />
                            Bearbeiten
                          </button>
                        )}
                        {/* Hide/Show - own entries + admin on any */}
                        {canHide && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMenu(false);
                              onHide?.();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-body-s text-primary hover:bg-secondary transition-colors"
                          >
                            {isHidden ? (
                              <>
                                <VisibilityIcon size={16} />
                                Einblenden
                              </>
                            ) : (
                              <>
                                <VisibilityOffIcon size={16} />
                                Verbergen
                              </>
                            )}
                          </button>
                        )}
                        {/* Report - admin on other's entries only */}
                        {canReport && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMenu(false);
                              onReport?.();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-body-s text-primary hover:bg-secondary transition-colors"
                          >
                            <ReportIcon size={16} />
                            Melden
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Wrapper 2: Content (Bilder + Text) */}
          <div
            className={`flex-1 flex flex-col gap-3 px-1 min-h-0 overflow-hidden ${
              isHidden ? 'opacity-50' : ''
            }`}
          >
            {/* ImageGallery im View-Mode - öffnet Lightbox */}
            {images.length > 0 && (
              <ImageGallery
                images={images}
                onImageClick={handleImageClick}
              />
            )}

            {/* Text Content */}
            <p className="w-full flex-1 overflow-y-auto text-body-m text-secondary whitespace-pre-wrap">
              {content}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox für View-Mode */}
      <Lightbox
        images={images.map((img) => ({ url: img.url }))}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        userName={userName}
        userAvatar={userAvatar}
      />
    </>
  );
}
