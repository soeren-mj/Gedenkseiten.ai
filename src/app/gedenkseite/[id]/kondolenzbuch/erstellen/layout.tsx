'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MemorialProvider } from '@/contexts/MemorialContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { Memorial } from '@/lib/supabase';

/**
 * Kondolenzbuch Erstellen Layout
 *
 * Minimal layout for kondolenzbuch editor pages (deckblatt, eintrag).
 * - Loads memorial data
 * - Provides MemorialProvider context
 * - Does NOT render BackendHeader (pages render their own)
 * - Passes children directly for proper sticky footer support
 */
export default function KondolenzbuchErstellenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [memorialId, setMemorialId] = useState<string | null>(null);

  // Unwrap params Promise
  useEffect(() => {
    params.then(({ id }) => setMemorialId(id));
  }, [params]);

  // Fetch memorial data when user and memorialId are available
  useEffect(() => {
    if (!user || !memorialId) return;

    const fetchMemorial = async () => {
      setLoading(true);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('memorials')
        .select('*')
        .eq('id', memorialId)
        .single();

      // Memorial not found or not authorized
      if (error || !data || data.creator_id !== user.id) {
        router.push('/dashboard');
        return;
      }

      setMemorial(data);
      setLoading(false);
    };

    fetchMemorial();
  }, [user, memorialId, router]);

  // Handle memorial updates from context
  const handleMemorialUpdate = useCallback((updatedMemorial: Memorial) => {
    setMemorial(updatedMemorial);
  }, []);

  // Show loading state
  if (!user || loading || !memorial || !memorialId) {
    return (
      <div className="min-h-screen bg-light-dark-mode flex items-center justify-center">
        <div className="animate-pulse text-secondary">Laden...</div>
      </div>
    );
  }

  // Pass children directly - no wrapper elements
  // This allows pages to control their own layout structure for sticky footer
  return (
    <MemorialProvider memorial={memorial} onUpdate={handleMemorialUpdate}>
      {children}
    </MemorialProvider>
  );
}
