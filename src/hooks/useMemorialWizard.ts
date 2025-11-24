/**
 * Hook for managing memorial creation wizard state
 *
 * Uses localStorage to persist state across page navigations
 */

import { useState, useCallback, useEffect } from 'react';

export type MemorialType = 'person' | 'pet';
export type WizardStep = 'type' | 'basic-info' | 'avatar' | 'privacy' | 'summary';

interface WizardState {
  // Current state
  currentStep: WizardStep;
  memorialType: MemorialType | null;

  // Form data (stored across steps)
  formData: {
    // Common fields
    type?: MemorialType;
    first_name?: string;
    last_name?: string;
    birth_date?: string;
    death_date?: string;
    birth_place?: string;
    death_place?: string;

    // Person fields
    gender?: string;
    salutation?: string;
    title?: string;
    second_name?: string;
    birth_name?: string;
    name_suffix?: string;
    nickname?: string;

    // Pet fields
    animal_type_id?: number;
    breed_group_id?: number;
    breed_id?: number;

    // Avatar
    avatar_type?: 'initials' | 'icon' | 'image';
    avatar_url?: string;
    avatar_file?: File;

    // Privacy
    privacy_level?: 'public' | 'private';
  };
}

const STEP_ORDER: WizardStep[] = ['type', 'basic-info', 'avatar', 'privacy', 'summary'];
const STORAGE_KEY = 'memorial-wizard-state';

// Helper to load state from localStorage
const loadStateFromStorage = (): WizardState => {
  if (typeof window === 'undefined') {
    return {
      currentStep: 'type',
      memorialType: null,
      formData: {},
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load wizard state from localStorage:', error);
  }

  return {
    currentStep: 'type',
    memorialType: null,
    formData: {},
  };
};

// Helper to save state to localStorage
const saveStateToStorage = (state: WizardState) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save wizard state to localStorage:', error);
  }
};

export function useMemorialWizard() {
  const [state, setState] = useState<WizardState>(loadStateFromStorage);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Set memorial type and advance to basic info
  const setMemorialType = useCallback((type: MemorialType) => {
    setState((prev) => ({
      ...prev,
      memorialType: type,
      currentStep: 'basic-info',
      formData: {
        ...prev.formData,
        type,
      },
    }));
  }, []);

  // Update form data for current step
  const updateFormData = useCallback((data: Partial<WizardState['formData']>) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...data,
      },
    }));
  }, []);

  // Navigate to next step
  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1);
      return {
        ...prev,
        currentStep: STEP_ORDER[nextIndex],
      };
    });
  }, []);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return {
        ...prev,
        currentStep: STEP_ORDER[prevIndex],
      };
    });
  }, []);

  // Navigate to specific step
  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  // Reset wizard
  const reset = useCallback(() => {
    setState({
      currentStep: 'type',
      memorialType: null,
      formData: {},
    });
  }, []);

  // Get progress percentage (for UI)
  const getProgress = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    return Math.round(((currentIndex + 1) / STEP_ORDER.length) * 100);
  }, [state.currentStep]);

  // Check if can go to next step (validation helper)
  const canGoNext = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    return currentIndex < STEP_ORDER.length - 1;
  }, [state.currentStep]);

  // Check if can go to previous step
  const canGoPrev = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    return currentIndex > 0;
  }, [state.currentStep]);

  return {
    // State
    currentStep: state.currentStep,
    memorialType: state.memorialType,
    formData: state.formData,

    // Actions
    setMemorialType,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    reset,

    // Helpers
    getProgress,
    canGoNext,
    canGoPrev,
  };
}
