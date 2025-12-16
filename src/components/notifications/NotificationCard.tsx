'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatRelativeTime } from '@/lib/utils/dateFormatter';
import type { Notification, ReactionType } from '@/lib/supabase';
import {
  ReactionLiebeIcon,
  ReactionDankbarkeitIcon,
  ReactionFreiheitIcon,
  ReactionBlumenIcon,
  ReactionKerzeIcon,
} from '@/components/icons/reactions';

// Map reaction types to icon components
const ReactionIcons: { [key in ReactionType]: React.ComponentType<{ size?: number; className?: string }> } = {
  liebe: ReactionLiebeIcon,
  dankbarkeit: ReactionDankbarkeitIcon,
  freiheit: ReactionFreiheitIcon,
  blumen: ReactionBlumenIcon,
  kerze: ReactionKerzeIcon,
};

// Personalized text for single reactions
const SingleReactionTexts: { [key in ReactionType]: string } = {
  liebe: 'hat Liebe gezeigt',
  dankbarkeit: 'hat Dankbarkeit gezeigt',
  freiheit: 'hat eine Taube fliegen lassen',
  blumen: 'hat Blumen gebracht',
  kerze: 'hat eine Kerze angezündet',
};

interface NotificationWithMemorial extends Notification {
  memorial_name?: string | null;
}

interface NotificationCardProps {
  notification: NotificationWithMemorial;
  href?: string;
  onRead?: () => void;
}

/**
 * NotificationCard - Single notification display
 *
 * Features:
 * - SVG dot for unread state (colorable via text-)
 * - Avatar with initials fallback (32x32)
 * - Reaction icons inline
 * - Relative timestamp
 * - Navigates to detail page when clicked
 */
export function NotificationCard({ notification, href, onRead }: NotificationCardProps) {
  const isUnread = !notification.is_read;

  // Generate initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Check if this is a single reaction
  const isSingleReaction = notification.type === 'reaction' &&
    notification.reaction_types?.length === 1;

  const singleReactionType = isSingleReaction
    ? notification.reaction_types![0] as ReactionType
    : null;

  // Generate notification text based on type
  const getNotificationText = () => {
    if (notification.type === 'reaction') {
      // Single reaction: personalized text (icon shown inline)
      if (singleReactionType) {
        return SingleReactionTexts[singleReactionType];
      }
      // Multiple reactions: generic text
      const count = notification.reaction_count || 1;
      return `hat ${count} Reaktionen hinterlassen`;
    }
    if (notification.type === 'kondolenz') {
      return 'hat einen Eintrag ins Kondolenzbuch verfasst';
    }
    // Future: beitrag
    return 'hat eine Aktivität ausgeführt';
  };

  // Handle click - mark as read and navigate
  const handleClick = () => {
    if (onRead) {
      onRead();
    }
  };

  const cardContent = (
    <>
      {/* Unread Indicator - SVG circle for text- color support */}
      <div className="w-2 flex-shrink-0 pt-2">
        {isUnread && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-interactive-info">
            <circle cx="4" cy="4" r="4" fill="currentColor" />
          </svg>
        )}
      </div>

      {/* Avatar - 32x32 */}
      <div className="flex-shrink-0">
        {notification.actor_avatar_url ? (
          <Image
            src={notification.actor_avatar_url}
            alt={notification.actor_name || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-interactive-primary-default flex items-center justify-center">
            <span className="text-white text-body-xs font-semibold">
              {getInitials(notification.actor_name)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <p className="text-webapp-group text-primary truncate">
          {notification.actor_name || 'Jemand'}
        </p>

        {/* Single Reaction: Icon + personalized text inline */}
        {singleReactionType && (
          <p className="flex items-center gap-1.5 text-body-s text-secondary mt-1">
            {React.createElement(ReactionIcons[singleReactionType], { size: 16 })}
            <span>{getNotificationText()}</span>
          </p>
        )}

        {/* Multiple Reactions: Icons above, generic text below */}
        {notification.type === 'reaction' && !singleReactionType && notification.reaction_types && (
          <>
            <div className="flex items-center gap-1 mt-1 text-secondary">
              {notification.reaction_types.map((type) => {
                const IconComponent = ReactionIcons[type as ReactionType];
                return IconComponent ? <IconComponent key={type} size={16} /> : null;
              })}
            </div>
            <p className="text-body-s text-secondary mt-1">
              {getNotificationText()}
            </p>
          </>
        )}

        {/* Non-reaction types: just text */}
        {notification.type !== 'reaction' && (
          <p className="text-body-s text-secondary mt-1">
            {getNotificationText()}
          </p>
        )}

        {/* Timestamp */}
        <p className="text-body-xs text-tertiary mt-1">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
    </>
  );

  const baseClassName = `
    w-full flex items-start gap-3 p-3 text-left transition-colors
    ${isUnread ? ' hover:bg-interactive-info-hover' : 'hover:bg-interactive-info-hover'}
  `;

  // If href is provided, render as Link
  if (href) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={baseClassName}
      >
        {cardContent}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      onClick={handleClick}
      className={baseClassName}
    >
      {cardContent}
    </button>
  );
}

export default NotificationCard;
