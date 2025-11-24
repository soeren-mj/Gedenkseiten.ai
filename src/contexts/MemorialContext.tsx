'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Memorial } from '@/lib/supabase';

interface MemorialContextType {
  memorial: Memorial;
  updateMemorial: (updates: Partial<Memorial>) => void;
}

const MemorialContext = createContext<MemorialContextType | null>(null);

export function MemorialProvider({
  memorial: initialMemorial,
  onUpdate,
  children,
}: {
  memorial: Memorial;
  onUpdate?: (memorial: Memorial) => void;
  children: React.ReactNode;
}) {
  const [memorial, setMemorial] = useState<Memorial>(initialMemorial);

  // Update memorial in context state
  const updateMemorial = useCallback((updates: Partial<Memorial>) => {
    setMemorial(prev => ({ ...prev, ...updates }));
  }, []);

  // Notify parent when memorial changes (deferred to avoid setState-during-render)
  useEffect(() => {
    onUpdate?.(memorial);
  }, [memorial, onUpdate]);

  // Sync with prop changes from layout (e.g., after fetching or refresh)
  useEffect(() => {
    setMemorial(initialMemorial);
  }, [initialMemorial]);

  return (
    <MemorialContext.Provider value={{ memorial, updateMemorial }}>
      {children}
    </MemorialContext.Provider>
  );
}

export function useMemorial() {
  const context = useContext(MemorialContext);
  if (!context) {
    throw new Error('useMemorial must be used within MemorialProvider');
  }
  return context;
}
