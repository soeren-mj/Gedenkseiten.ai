/**
 * Memorial Access Control Utilities
 * Handles privacy-level checks and access permissions for memorial pages
 */

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase';

type Memorial = Database['public']['Tables']['memorials']['Row'];

export interface MemorialAccessResult {
  hasAccess: boolean;
  memorial: Memorial | null;
  accessReason?: 'public' | 'owner' | 'invited' | 'denied';
  userRole?: 'administrator' | 'member' | null;
}

/**
 * Check if a user has access to view a memorial
 *
 * Access Rules:
 * - Public memorials: Anyone can view (including unauthenticated users)
 * - Private memorials: Only owner (creator) or invited users with accepted invitations
 *
 * @param memorialId - The UUID of the memorial to check
 * @param userId - Optional user ID (if authenticated)
 * @returns MemorialAccessResult with access status and memorial data
 */
export async function checkMemorialAccess(
  memorialId: string,
  userId?: string
): Promise<MemorialAccessResult> {
  const supabase = await createClient();

  // Fetch the memorial
  const { data: memorial, error: memorialError } = await supabase
    .from('memorials')
    .select('*')
    .eq('id', memorialId)
    .single();

  // DEBUG: Log memorial fetch result
  console.log('[checkMemorialAccess] Memorial fetch result:', {
    memorialId,
    found: !!memorial,
    error: memorialError?.message,
    privacyLevel: memorial?.privacy_level,
    createdBy: memorial?.created_by,
  });

  if (memorialError || !memorial) {
    console.error('[checkMemorialAccess] Memorial not found or error:', memorialError);
    return {
      hasAccess: false,
      memorial: null,
      accessReason: 'denied',
    };
  }

  // Public memorials: everyone has access
  if (memorial.privacy_level === 'public') {
    console.log('[checkMemorialAccess] Public memorial - granting access');
    return {
      hasAccess: true,
      memorial,
      accessReason: 'public',
      userRole: null,
    };
  }

  // Private memorials: check if user is authenticated
  if (!userId) {
    return {
      hasAccess: false,
      memorial: null,
      accessReason: 'denied',
    };
  }

  // Check if user is the owner (creator)
  if (memorial.created_by === userId) {
    return {
      hasAccess: true,
      memorial,
      accessReason: 'owner',
      userRole: 'administrator',
    };
  }

  // Check if user has an accepted invitation
  const { data: invitation, error: invitationError } = await supabase
    .from('memorial_invitations')
    .select('*')
    .eq('memorial_id', memorialId)
    .eq('invited_user_id', userId)
    .eq('status', 'accepted')
    .single();

  if (invitationError || !invitation) {
    return {
      hasAccess: false,
      memorial: null,
      accessReason: 'denied',
    };
  }

  // User has accepted invitation
  return {
    hasAccess: true,
    memorial,
    accessReason: 'invited',
    userRole: invitation.role,
  };
}

/**
 * Increment the view count for a memorial
 * Only increments for public memorials to avoid inflating private memorial views
 *
 * @param memorialId - The UUID of the memorial
 * @returns Boolean indicating success
 */
export async function incrementMemorialViewCount(
  memorialId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_memorial_view_count', {
    memorial_id: memorialId,
  });

  return !error;
}

/**
 * Get the administrator/creator profile for a memorial
 *
 * @param createdBy - User ID of the memorial creator
 * @returns User profile or null
 */
export async function getMemorialAdministrator(createdBy: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .eq('id', createdBy)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile;
}
