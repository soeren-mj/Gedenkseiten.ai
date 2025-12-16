'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { WissenswertesItem } from '@/components/memorial/WissenswertesItem';
import { WissenswertesForm } from '@/components/memorial/WissenswertesForm';
import { useToast } from '@/contexts/ToastContext';
import { createClient } from '@/lib/supabase/client-legacy';
import type { Wissenswertes } from '@/lib/supabase';

const MAX_ENTRIES = 12;

interface WissenswertesManagerProps {
  memorialId: string;
  firstName: string;
  lastName: string;
}

/**
 * WissenswertesManager Component
 *
 * Main component for managing wissenswertes entries.
 * Features:
 * - List of entries with drag-and-drop sorting
 * - Inline form for adding/editing entries
 * - Delete confirmation
 * - Real-time count display
 */
export function WissenswertesManager({ memorialId, firstName, lastName }: WissenswertesManagerProps) {
  const [items, setItems] = useState<Wissenswertes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Wissenswertes | null>(null);
  const { showSuccess, showError } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch entries on mount
  const fetchEntries = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/memorials/${memorialId}/wissenswertes`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden');
      }

      const result = await response.json();
      setItems(result.data || []);
    } catch (err) {
      console.error('Error fetching wissenswertes:', err);
      showError('Fehler', 'Wissenswertes konnte nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  }, [memorialId, showError]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Get auth token helper
  const getAuthToken = async (): Promise<string | null> => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  // Handle drag end - update order
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems); // Optimistic update

      try {
        const token = await getAuthToken();
        if (!token) {
          showError('Fehler', 'Nicht authentifiziert');
          setItems(items); // Revert
          return;
        }

        const response = await fetch(`/api/memorials/${memorialId}/wissenswertes/reorder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderedIds: newItems.map(item => item.id),
          }),
        });

        if (!response.ok) {
          throw new Error('Fehler beim Speichern der Reihenfolge');
        }
      } catch (err) {
        console.error('Error reordering:', err);
        showError('Fehler', 'Reihenfolge konnte nicht gespeichert werden');
        setItems(items); // Revert
      }
    }
  };

  // Add new entry
  const handleAdd = async (emoji: string, text: string) => {
    setIsSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        showError('Fehler', 'Nicht authentifiziert');
        return;
      }

      const response = await fetch(`/api/memorials/${memorialId}/wissenswertes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji, text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Erstellen');
      }

      const result = await response.json();
      setItems([...items, result.data]);
      setShowAddForm(false);
      showSuccess('Gespeichert', 'Eintrag wurde hinzugefügt');
    } catch (err) {
      console.error('Error adding entry:', err);
      showError('Fehler', err instanceof Error ? err.message : 'Eintrag konnte nicht erstellt werden');
    } finally {
      setIsSaving(false);
    }
  };

  // Update entry
  const handleUpdate = async (emoji: string, text: string) => {
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        showError('Fehler', 'Nicht authentifiziert');
        return;
      }

      const response = await fetch(
        `/api/memorials/${memorialId}/wissenswertes/${editingItem.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ emoji, text }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Aktualisieren');
      }

      const result = await response.json();
      setItems(items.map(item => item.id === editingItem.id ? result.data : item));
      setEditingItem(null);
      showSuccess('Gespeichert', 'Eintrag wurde aktualisiert');
    } catch (err) {
      console.error('Error updating entry:', err);
      showError('Fehler', err instanceof Error ? err.message : 'Eintrag konnte nicht aktualisiert werden');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entry
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = await getAuthToken();
      if (!token) {
        showError('Fehler', 'Nicht authentifiziert');
        return;
      }

      const response = await fetch(
        `/api/memorials/${memorialId}/wissenswertes/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Fehler beim Löschen');
      }

      setItems(items.filter(item => item.id !== id));
      showSuccess('Gelöscht', 'Eintrag wurde entfernt');
    } catch (err) {
      console.error('Error deleting entry:', err);
      showError('Fehler', 'Eintrag konnte nicht gelöscht werden');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle edit click
  const handleEditClick = (item: Wissenswertes) => {
    setShowAddForm(false);
    setEditingItem(item);
  };

  // Cancel add/edit
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
  };

  // Show add form
  const handleShowAddForm = () => {
    setEditingItem(null);
    setShowAddForm(true);
  };

  const canAddMore = items.length < MAX_ENTRIES;
  const isFormOpen = showAddForm || editingItem !== null;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-bw-opacity-40 rounded-xxs animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <h2 className="text-webapp-group text-primary">
        Wissenswertes über {firstName} {lastName || ''}
      </h2>

      {/* Entries List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item) => (
              editingItem?.id === item.id ? (
                <WissenswertesForm
                  key={item.id}
                  initialEmoji={item.emoji}
                  initialText={item.text}
                  onSave={handleUpdate}
                  onCancel={handleCancel}
                  isLoading={isSaving}
                />
              ) : (
                <WissenswertesItem
                  key={item.id}
                  item={item}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                  isDeleting={deletingId === item.id}
                />
              )
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Form (shown inline when adding) */}
      {showAddForm && (
        <WissenswertesForm
          onSave={handleAdd}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      )}

      {/* Add Button (hidden when form is open or max reached) */}
      {!isFormOpen && canAddMore && (
        <button
          type="button"
          onClick={handleShowAddForm}
          className="
            w-full py-2 px-3
            flex items-center justify-center gap-2
            bg-bw-opacity-40 border-2 border-dashed border-interactive-default
            rounded-xs text-link-default text-body-m
            hover:bg-bw-opacity-60 hover:text-link-hover transition-colors
          "
        >
          <Plus className="w-5 h-5" />
          Hinzufügen
        </button>
      )}

      {/* Counter */}
      <p className="text-body-s text-tertiary text-right">
        {items.length} von {MAX_ENTRIES}
      </p>
    </div>
  );
}
