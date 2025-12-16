'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BackendHeader from '@/components/dashboard/BackendHeader';
import FeedbackButton from '@/components/ui/FeedbackButton';
import { MemorialProvider } from '@/contexts/MemorialContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client-legacy';
import type { Memorial } from '@/lib/supabase';

/**
 * Memorial Management Layout
 *
 * Layout for memorial management pages.
 * Uses same styling as dashboard (BackendHeader + FeedbackButton).
 * Fetches memorial data for context.
 * Client-side authorization check ensures only creator can access.
 */
export default function MemorialManagementLayout({
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

      // Memorial not found
      if (error || !data) {
        router.push('/dashboard');
        return;
      }

      // Authorization check - only creator can access
      if (data.creator_id !== user.id) {
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
      <div className="min-h-screen bg-light-dark-mode flex flex-col">
        <BackendHeader />
        <main className="flex-1 overflow-x-visible overflow-y-auto px-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-3 pt-4">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interactive-default mx-auto mb-4"></div>
              <p className="text-body-m text-secondary">Laden...</p>
            </div>
          </div>
        </main>
        <FeedbackButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-dark-mode flex flex-col">
      <BackendHeader />
      <main className="flex-1 overflow-x-visible overflow-y-auto px-6">
        <MemorialProvider memorial={memorial} onUpdate={handleMemorialUpdate}>
          {children}
        </MemorialProvider>
      </main>
      <FeedbackButton />
    </div>
  );
}
