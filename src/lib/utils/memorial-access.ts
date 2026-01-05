/**
 * Memorial Access Control Utilities
 * Handles privacy-level checks and access permissions for memorial pages
 */

import { createClient } from '@/lib/supabase/server';
import { Memorial, MemorialInvitation, supabase as legacySupabase } from '@/lib/supabase';

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
  const { data, error: memorialError } = await supabase
    .from('memorials')
    .select('*')
    .eq('id', memorialId)
    .single();

  if (memorialError || !data) {
    console.error('[checkMemorialAccess] Memorial not found or error:', memorialError);
    return {
      hasAccess: false,
      memorial: null,
      accessReason: 'denied',
    };
  }

  // Cast to Memorial type
  const memorial = data as Memorial;

  // For pet memorials, fetch animal names separately using legacy client
  // (Server client has issues with these tables)
  if (memorial.type === 'pet') {
    // Fetch Tierart
    if (memorial.animal_type_id) {
      const { data: tierartData } = await legacySupabase
        .from('Tierarten')
        .select('Tierart_Name')
        .eq('Tierart_ID', memorial.animal_type_id)
        .single();
      if (tierartData) {
        memorial.Tierarten = tierartData as { Tierart_Name: string };
      }
    }

    // Fetch Rassengruppe
    if (memorial.breed_group_id) {
      const { data: rassengruppeData } = await legacySupabase
        .from('Rassengruppe')
        .select('Rassengruppe_Name')
        .eq('Rassengruppe_ID', memorial.breed_group_id)
        .single();
      if (rassengruppeData) {
        memorial.Rassengruppe = rassengruppeData as { Rassengruppe_Name: string };
      }
    }

    // Fetch Rasse
    if (memorial.breed_id) {
      const { data: rasseData } = await legacySupabase
        .from('Rassen')
        .select('Rasse_Name')
        .eq('Rassen_ID', memorial.breed_id)
        .single();
      if (rasseData) {
        memorial.Rassen = rasseData as { Rasse_Name: string };
      }
    }
  }

  // Public memorials: everyone has access
  // But still check if authenticated user is the creator (for admin controls)
  if (memorial.privacy_level === 'public') {
    const isCreator = userId && memorial.creator_id === userId;
    console.log('[checkMemorialAccess] Public memorial - granting access', {
      isCreator,
      userId,
      creatorId: memorial.creator_id,
    });
    return {
      hasAccess: true,
      memorial,
      accessReason: 'public',
      userRole: isCreator ? 'administrator' : null,
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
  if (memorial.creator_id === userId) {
    return {
      hasAccess: true,
      memorial,
      accessReason: 'owner',
      userRole: 'administrator',
    };
  }

  // Check if user has an accepted invitation
  const { data: invitationData, error: invitationError } = await supabase
    .from('memorial_invitations')
    .select('*')
    .eq('memorial_id', memorialId)
    .eq('invited_user_id', userId)
    .eq('status', 'accepted')
    .single();

  const invitation = invitationData as MemorialInvitation | null;

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)('increment_memorial_view_count', {
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
