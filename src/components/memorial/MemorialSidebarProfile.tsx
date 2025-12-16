'use client';

import Link from 'next/link';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import { Badge } from '@/components/ui/Badge';
import { formatFullName } from '@/lib/utils/nameFormatter';

interface MemorialSidebarProfileProps {
  memorial: {
    id: string;
    first_name: string;
    last_name: string | null;
    type: 'person' | 'pet';
    avatar_type: 'initials' | 'image';
    avatar_url: string | null;
    privacy_level: 'public' | 'private';
  };
}

/**
 * MemorialSidebarProfile Component
 *
 * Displays memorial avatar, name, and privacy badge in the management sidebar.
 * Now uses horizontal layout matching Dashboard profile styling.
 * Uses design system classes:
 * - text-webapp-group for name
 * - text-chip for badge (10px Semi Bold uppercase)
 * - bg-interactive-positive-default for "Öffentlich", bg-bw for "Privat"
 * - text-bw for badge text
 */
export const MemorialSidebarProfile = ({ memorial }: MemorialSidebarProfileProps) => {
  const displayName = formatFullName(memorial);
  const isPublic = memorial.privacy_level === 'public';

  return (
    <Link
      href={`/gedenkseite/${memorial.id}/verwalten`}
      className="flex items-center gap-3 p-1 rounded-lg hover:bg-bw-opacity-60 transition-colors"
    >
      {/* Avatar */}
      <InitialsAvatar
        name={displayName}
        imageUrl={memorial.avatar_url}
        avatarType={memorial.avatar_type}
        memorialType={memorial.type}
        size="sm"
      />

      {/* Name and Badge - Horizontal Layout */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p className="text-webapp-group truncate">
          {displayName}
        </p>
        <Badge variant={isPublic ? 'public' : 'private'}>
          {isPublic ? 'Öffentlich' : 'Privat'}
        </Badge>
      </div>
    </Link>
  );
};
