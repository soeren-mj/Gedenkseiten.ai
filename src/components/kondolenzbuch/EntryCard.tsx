'use client';

import { useState } from 'react';
import { MoreVertical, Trash2, Pencil } from 'lucide-react';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import { Badge } from '@/components/ui/Badge';
import { CondolenceEntryWithDetails } from '@/lib/supabase';

interface EntryCardProps {
  entry: CondolenceEntryWithDetails;
  isOwn: boolean;
  isAdmin: boolean;
  isNew: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Entry Card Component
 *
 * Displays a single condolence entry in the list.
 * Shows user info, content, optional image thumbnails, and action menu.
 */
export function EntryCard({
  entry,
  isOwn,
  isAdmin,
  isNew,
  onEdit,
  onDelete,
}: EntryCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Get user display info
  const userName =
    typeof entry.user === 'object' && entry.user !== null
      ? entry.user.name || 'Unbekannt'
      : 'Unbekannt';
  const userAvatar =
    typeof entry.user === 'object' && entry.user !== null
      ? entry.user.avatar_url
      : null;

  // Get images array
  const images = Array.isArray(entry.images) ? entry.images : [];
  const displayImages = images.slice(0, 4);
  const remainingImages = images.length - 4;

  // Format date
  const formattedDate = new Date(entry.created_at).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const canShowMenu = (isOwn && onEdit) || ((isOwn || isAdmin) && onDelete);

  return (
    <div className="bg-bw-opacity-40 rounded-md shadow-card p-1">
      <div className="bg-light-dark-mode rounded-sm p-4 flex flex-col gap-3">
        {/* Header: Avatar, Name, Date, Menu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <InitialsAvatar
              name={userName}
              imageUrl={userAvatar}
              size="sm"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-body-m text-primary font-medium">
                  {userName}
                </span>
                {isNew && (
                  <Badge variant="warning" size="small">
                    Neu
                  </Badge>
                )}
              </div>
              <span className="text-body-xs text-tertiary">{formattedDate}</span>
            </div>
          </div>

          {/* Action Menu */}
          {canShowMenu && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-secondary rounded-xs transition-colors"
                aria-label="Aktionen"
              >
                <MoreVertical className="w-5 h-5 text-secondary" />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 top-full mt-1 z-20 bg-primary border border-card rounded-sm shadow-lg min-w-[150px]">
                    {isOwn && onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onEdit();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-body-s text-primary hover:bg-secondary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Bearbeiten
                      </button>
                    )}
                    {(isOwn || isAdmin) && onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onDelete();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-body-s text-negative hover:bg-secondary transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Löschen
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Image Thumbnails (if any) */}
        {displayImages.length > 0 && (
          <div className="flex gap-2">
            {displayImages.map((image, index) => (
              <div
                key={image.id}
                className="relative w-16 h-16 rounded-xs overflow-hidden bg-secondary"
              >
                <img
                  src={image.image_url}
                  alt={`Bild ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && remainingImages > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-body-s font-medium">
                      +{remainingImages}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="max-h-[120px] overflow-y-auto">
          <p className="text-body-m text-secondary whitespace-pre-wrap">
            {entry.content}
          </p>
        </div>
      </div>
    </div>
  );
}
