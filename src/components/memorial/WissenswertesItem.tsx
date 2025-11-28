'use client';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Wissenswertes } from '@/lib/supabase';

const AUTO_HIDE_DELAY = 3000; // 3 seconds

interface WissenswertesItemProps {
  item: Wissenswertes;
  onEdit: (item: Wissenswertes) => void;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

/**
 * WissenswertesItem Component
 *
 * Layout: [ [Emoji] [Text...] [≡ Drag] ]  [🗑️ / Löschen]
 *
 * Features:
 * - Item container with Emoji + Text + Drag-Handle (right)
 * - Trash icon outside container, far right
 * - Click trash → "Löschen" button appears (auto-hides after 3s)
 * - Click on item → Edit mode
 */
export function WissenswertesItem({
  item,
  onEdit,
  onDelete,
  isDeleting = false,
}: WissenswertesItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Auto-hide delete confirmation after 3 seconds
  useEffect(() => {
    if (showDeleteConfirm && !isDeleting) {
      const timer = setTimeout(() => {
        setShowDeleteConfirm(false);
      }, AUTO_HIDE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [showDeleteConfirm, isDeleting]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDelete(item.id);
    setShowDeleteConfirm(false);
  };

  const handleItemClick = () => {
    // If delete confirmation is showing, clicking on the item cancels it
    if (showDeleteConfirm) {
      setShowDeleteConfirm(false);
      return;
    }
    // Open edit mode if not currently deleting
    if (!isDeleting) {
      onEdit(item);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3"
    >
      {/* Item Container - clickable for edit */}
      <div
        className={`
          flex-1 flex items-center gap-3 py-2 px-3
          bg-bw border border-main rounded-xs
          ${isDragging ? 'shadow-lg' : ''}
          ${!showDeleteConfirm && !isDeleting ? 'cursor-pointer hover:bg-bw-opacity-60' : ''}
          transition-colors duration-150
        `}
        onClick={handleItemClick}
      >
        {/* Emoji */}
        <span className="text-body-m">{item.emoji}</span>

        {/* Text */}
        <span className="flex-1 text-body-m-semibold text-primary truncate">
          {item.text}
        </span>

        {/* Drag Handle - right side of container */}
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-tertiary hover:text-secondary"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
          aria-label="Ziehen zum Sortieren"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Delete Button or Trash Icon - outside container */}
      {showDeleteConfirm ? (
        <Button
          variant="negative"
          size="sm"
          onClick={handleConfirmDelete}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Löschen
        </Button>
      ) : (
        <button
          type="button"
          onClick={handleDeleteClick}
          className="p-2 text-tertiary hover:text-message-error transition-colors flex-shrink-0"
          aria-label="Eintrag löschen"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
