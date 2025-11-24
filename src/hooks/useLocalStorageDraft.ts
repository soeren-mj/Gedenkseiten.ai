/**
 * Hook for auto-saving memorial creation drafts to localStorage
 * Prevents data loss if user accidentally closes browser
 */

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

const STORAGE_KEY_PREFIX = 'memorial-draft';
const DEBOUNCE_DELAY = 500; // ms

interface DraftOptions {
  userId: string;
  memorialType?: 'person' | 'pet';
}

/**
 * Auto-saves form data to localStorage with debouncing
 * Returns draft data on mount and provides save/clear functions
 */
export function useLocalStorageDraft<T extends Record<string, unknown>>(
  initialData: T,
  options: DraftOptions
) {
  const { userId, memorialType } = options;
  const storageKey = memorialType
    ? `${STORAGE_KEY_PREFIX}-${userId}-${memorialType}`
    : `${STORAGE_KEY_PREFIX}-${userId}`;

  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounced version of data for auto-save
  const debouncedData = useDebounce(data, DEBOUNCE_DELAY);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          data: T;
          savedAt: string;
        };

        // Only load if saved within last 7 days
        const savedAt = new Date(parsed.savedAt);
        const daysSince = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSince < 7) {
          setData(parsed.data);
          setLastSaved(savedAt);
        } else {
          // Clean up old draft
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Failed to load draft from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Auto-save to localStorage when data changes (debounced)
  useEffect(() => {
    if (isLoading) return; // Don't save on initial load

    try {
      const toSave = {
        data: debouncedData,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(toSave));
      setLastSaved(new Date());
    } catch (error) {
      // Handle QuotaExceededError
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Draft not saved.');
        // Optionally show user notification
      } else {
        console.error('Failed to save draft to localStorage:', error);
      }
    }
  }, [debouncedData, isLoading, storageKey]);

  // Manual save function
  const saveDraft = useCallback(() => {
    try {
      const toSave = {
        data,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(toSave));
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Failed to save draft:', error);
      return false;
    }
  }, [data, storageKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setData(initialData);
      setLastSaved(null);
      return true;
    } catch (error) {
      console.error('Failed to clear draft:', error);
      return false;
    }
  }, [storageKey, initialData]);

  // Check if draft exists
  const hasDraft = useCallback(() => {
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  }, [storageKey]);

  return {
    data,
    setData,
    isLoading,
    lastSaved,
    saveDraft,
    clearDraft,
    hasDraft: hasDraft(),
  };
}
