'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactionType } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import LoginModal from '@/components/auth/LoginModal';
import {
  ReactionLiebeIcon,
  ReactionDankbarkeitIcon,
  ReactionFreiheitIcon,
  ReactionBlumenIcon,
  ReactionKerzeIcon,
} from '@/components/icons/reactions';

// Map reaction types to icon components
const ReactionIconComponents: {
  [key in ReactionType]: React.ComponentType<{
    size?: number;
    className?: string;
    variant?: 'outline' | 'filled';
  }>;
} = {
  liebe: ReactionLiebeIcon,
  dankbarkeit: ReactionDankbarkeitIcon,
  freiheit: ReactionFreiheitIcon,
  blumen: ReactionBlumenIcon,
  kerze: ReactionKerzeIcon,
};

const REACTION_ORDER: ReactionType[] = ['liebe', 'dankbarkeit', 'freiheit', 'blumen', 'kerze'];

type ReactionCounts = { [key in ReactionType]: number };

interface ReactionsBarProps {
  memorialId: string;
  className?: string;
}

/**
 * ReactionsBar - Horizontal reaction bar for the public memorial page
 * Shows reaction counts and allows users to toggle reactions
 * Opens login modal if user is not authenticated
 */
export default function ReactionsBar({ memorialId, className = '' }: ReactionsBarProps) {
  const { user, loading: authLoading } = useAuth();
  const [counts, setCounts] = useState<ReactionCounts>({
    liebe: 0,
    dankbarkeit: 0,
    freiheit: 0,
    blumen: 0,
    kerze: 0,
  });
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState<ReactionType | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Sort reactions by count (highest first), maintaining original order for equal counts
  const sortedReactions = useMemo(() => {
    return [...REACTION_ORDER].sort((a, b) => counts[b] - counts[a]);
  }, [counts]);

  // Fetch reactions on mount
  const fetchReactions = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/memorials/${memorialId}/reactions`, {
        headers,
      });

      const result = await response.json();
      if (result.success) {
        setCounts(result.data.counts);
        setUserReactions(result.data.userReactions);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [memorialId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Process pending reaction after login
  useEffect(() => {
    if (!user || authLoading) return;

    const pendingStr = localStorage.getItem('pending_reaction');
    if (!pendingStr) return;

    try {
      const pending = JSON.parse(pendingStr) as {
        memorialId: string;
        reactionType: ReactionType;
        timestamp: number;
      };

      // Only process if same memorial and not too old (5 min)
      const isValidMemorial = pending.memorialId === memorialId;
      const isNotExpired = Date.now() - pending.timestamp < 5 * 60 * 1000;

      if (isValidMemorial && isNotExpired) {
        localStorage.removeItem('pending_reaction');
        // Small delay to ensure session is ready
        setTimeout(() => {
          handleReactionClick(pending.reactionType);
        }, 500);
      } else {
        localStorage.removeItem('pending_reaction');
      }
    } catch {
      localStorage.removeItem('pending_reaction');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, memorialId]);

  // Handle reaction click
  const handleReactionClick = async (reactionType: ReactionType) => {
    // Wait for auth to load before checking
    if (authLoading) {
      return;
    }

    // Get session token for API call
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!user || !session) {
      // Save pending reaction to localStorage for after login
      localStorage.setItem('pending_reaction', JSON.stringify({
        memorialId,
        reactionType,
        timestamp: Date.now()
      }));
      // Show login modal instead of redirecting
      setShowLoginModal(true);
      return;
    }

    // Optimistic update
    const wasSelected = userReactions.includes(reactionType);
    setIsToggling(reactionType);

    setCounts(prev => ({
      ...prev,
      [reactionType]: wasSelected ? prev[reactionType] - 1 : prev[reactionType] + 1,
    }));

    setUserReactions(prev =>
      wasSelected
        ? prev.filter(r => r !== reactionType)
        : [...prev, reactionType]
    );

    try {
      const response = await fetch(`/api/memorials/${memorialId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ reactionType }),
      });

      const result = await response.json();
      if (result.success) {
        // Sync with server response
        setCounts(result.data.counts);
        setUserReactions(result.data.userReactions);
      } else {
        // Revert on error
        await fetchReactions();
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      // Revert on error
      await fetchReactions();
    } finally {
      setIsToggling(null);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {sortedReactions.map((type) => (
          <div key={type} className="flex items-center gap-1 animate-pulse">
            <div className="w-5 h-5 bg-tertiary rounded" />
            <div className="w-4 h-4 bg-tertiary rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-4 ${className}`}>
        {sortedReactions.map((type) => {
          const isSelected = userReactions.includes(type);
          const count = counts[type];
          const isCurrentlyToggling = isToggling === type;

          return (
            <button
              key={type}
              onClick={() => handleReactionClick(type)}
              disabled={isCurrentlyToggling}
              className={`
                flex items-center gap-1 py-1 px-1 rounded-md transition-all duration-200
                ${isSelected
                  ? 'text-accent hover:text-secondary'
                  : 'text-secondary hover:text-accent'
                }
                ${isCurrentlyToggling ? 'opacity-50' : ''}
                focus:outline-none focus:ring-2 focus:ring-interactive-primary-default focus:ring-offset-1
              `}
              title={getReactionTooltip(type)}
              aria-label={`${getReactionTooltip(type)}: ${count}`}
            >
              {(() => {
                const IconComponent = ReactionIconComponents[type];
                return (
                  <span className={`transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
                    <IconComponent size={24} variant={isSelected ? 'filled' : 'outline'} />
                  </span>
                );
              })()}
              <span className="text-body-s min-w-[1rem] text-center">
                {count > 0 ? count : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Login Modal for unauthenticated users */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectUrl={typeof window !== 'undefined' ? window.location.pathname : undefined}
        title="Anmelden"
      />
    </>
  );
}

function getReactionTooltip(type: ReactionType): string {
  const tooltips: { [key in ReactionType]: string } = {
    liebe: 'Liebe',
    dankbarkeit: 'Dankbarkeit',
    freiheit: 'Freiheit/Frieden',
    blumen: 'Gedenkblumen',
    kerze: 'Gedenkkerze',
  };
  return tooltips[type];
}
