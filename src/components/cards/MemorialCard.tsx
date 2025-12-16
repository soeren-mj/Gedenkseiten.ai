'use client';

import { useRouter } from 'next/navigation';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import { formatFullName } from '@/lib/utils/nameFormatter';
import BellNotificationIcon from '@/components/icons/BellNotificationIcon';
import BellNotificationActiveIcon from '@/components/icons/BellNotificationActiveIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';
import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon';

interface MemorialCardProps {
  memorial: {
    id: string;
    type: 'person' | 'pet' | 'tier'; // DB uses 'pet', routes use 'tier'
    first_name: string;
    last_name: string | null;
    avatar_type: 'initials' | 'image';
    avatar_url: string | null;
    privacy_level: 'public' | 'private';
  };
  visitorCount?: number;
  hasUnreadNotifications?: boolean;
  onNotifications?: () => void;
  onSettings?: () => void;
  onViewPublic?: () => void;
}

/**
 * MemorialCard Component
 *
 * Displays a memorial card on the dashboard with avatar, name, type, visitor count, and action buttons.
 * Design based on docs/Screenshots-dashboard/Signup-flow/Webapp/desktop/dashboard-filled.jpg
 */
export function MemorialCard({
  memorial,
  visitorCount = 0,
  hasUnreadNotifications = false,
  onNotifications,
  onSettings,
  onViewPublic,
}: MemorialCardProps) {
  const router = useRouter();

  // Normalize type ('pet' from DB should be treated as 'tier')
  const isPerson = memorial.type === 'person';

  // Format display name using formatFullName utility
  const displayName = formatFullName(memorial);

  // Type label
  const typeLabel = isPerson ? 'Personenseite' : 'Tierseite';

  // Default click handlers if not provided
  const handleNotifications = onNotifications || (() => router.push(`/gedenkseite/${memorial.id}/verwalten/benachrichtigungen`));
  const handleSettings = onSettings || (() => router.push(`/gedenkseite/${memorial.id}/verwalten`));
  const handleViewPublic = onViewPublic || (() => window.open(`/gedenkseite/${memorial.id}`, '_blank'));

  return (
    <div className="min-w-[247px] max-w-full aspect-square bg-bw-opacity-40 rounded-md shadow-card flex flex-col items-center p-1 justify-center">
     
      {/* Card content */}
      <div className="w-full h-full bg-light-dark-mode px-4 pt-4 pb-2 rounded-sm flex flex-col items-center justify-between">

      {/* Gedenkseite: Avatar + Name + Type */}
      <div className='flex items-start gap-4 w-full'>
      
       {/* Top Section: Avatar with Green Dot */}
       <div className="relative">
         <InitialsAvatar
           name={displayName}
           imageUrl={memorial.avatar_url}
           avatarType={memorial.avatar_type}
           size="md"
         />
         {/* Green Dot Indicator */}
         <div className="absolute top-7 -right-0.5 w-3 h-3 bg-accent-green rounded-full border-2 border-main" />
       </div>

       {/* Name, Type */}
       <div className="flex flex-col items-start justify-center min-w-0 flex-1">
         {/* Name */}
         <p className="text-webapp-group line-clamp-2 w-full break-words">
          {displayName}
         </p>

         {/* Type Badge */}
         <span className="text-body-xs text-secondary">
           {typeLabel}
         </span>
        </div>
     </div>

        {/* Middle Section: Visitor Count */}
      <div className="flex flex-col items-center justify-center w-full ">
          <div className="text-display-number text-secondary">
            {visitorCount}
          </div>
          <div className="text-body-s text-secondary">
            Besucher
          </div>
      </div>

      {/* Bottom Section: Action Icons */}
      <div className="flex items-center justify-between w-full px-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNotifications();
          }}
          aria-label="Benachrichtigungen"
          className="p-2 hover:bg-secondary rounded-md transition-colors group"
        >
          {hasUnreadNotifications ? (
            <BellNotificationActiveIcon className="w-6 h-6 text-interactive-info" />
          ) : (
            <BellNotificationIcon className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSettings();
          }}
          aria-label="Einstellungen"
          className="p-2 hover:bg-secondary rounded-md transition-colors group"
        >
          <SettingsIcon className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewPublic();
          }}
          aria-label="Öffentlich ansehen"
          className="p-2 hover:bg-secondary rounded-md transition-colors group"
        >
          <ExternalLinkIcon className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
        </button>
      </div>
      </div>
    </div>
  );
}
