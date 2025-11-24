'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MemorialProvider } from '@/contexts/MemorialContext';
import { MemorialSidebarSkeleton } from '@/components/memorial/MemorialSidebarSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client-legacy';
import type { Memorial } from '@/lib/supabase';

/**
 * Memorial Management Layout
 *
 * Layout for memorial management pages with sidebar navigation.
 * Uses same styling as dashboard (background blur, sidebar + content split).
 * Fetches memorial data for sidebar display.
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

  // Show skeleton while waiting for auth or loading memorial
  if (!user || loading || !memorial || !memorialId) {
    return (
      <div className="h-screen flex flex-col">
        {/* Background Blur Image */}
        <div className="fixed inset-0 -z-1">
          <Image
            src="/images/blur-default-0.75.webp"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Main Content Container with Skeleton */}
        <div className="flex-1 flex overflow-hidden z-10">
          {/* Sidebar with Skeleton */}
          <aside className="hidden md:block w-1/4">
            <div className="w-full bg-bw-opacity-40 h-full flex flex-col p-6 backdrop-blur-md">
              <MemorialSidebarSkeleton />
            </div>
          </aside>

          {/* Main Content Area with Loading */}
          <main className="w-full md:w-3/4 h-full p-10 bg-bw-opacity-60 overflow-y-auto backdrop-blur-lg">
            <div className="max-w-3xl mx-auto">
              <p className="text-body-m text-secondary">Laden...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Background Blur Image */}
      <div className="fixed inset-0 -z-1">
        <Image
          src="/images/blur-default-0.75.webp"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Sidebar - Memorial Management Mode */}
        <aside className="hidden md:block w-1/4">
          <Sidebar
            mode="memorial-management"
            memorialId={memorialId}
            memorial={memorial}
          />
        </aside>

        {/* Main Content Area - Wrapped with MemorialProvider */}
        <main className="w-full md:w-3/4 h-full p-10 bg-bw-opacity-60 overflow-y-auto backdrop-blur-lg">
          <MemorialProvider memorial={memorial} onUpdate={handleMemorialUpdate}>
            {children}
          </MemorialProvider>
        </main>
      </div>
    </div>
  );
}
