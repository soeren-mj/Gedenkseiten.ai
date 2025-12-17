'use client';

import Link from 'next/link';
import StammdatenIcon from '@/components/icons/StammdatenIcon';
import DarstellungIcon from '@/components/icons/DarstellungIcon';
import PrivatsphaereIcon from '@/components/icons/PrivatsphaereIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';

interface SettingsHubCardProps {
  memorialId: string;
  className?: string;
}

interface SettingsMenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
}

/**
 * SettingsHubCard Component
 *
 * HubCard variant displaying memorial settings menu.
 * Square format matching other HubCards in the grid.
 *
 * Options:
 * 1. Stammdaten verwalten → /verwalten/stammdaten
 * 2. Darstellung ändern → /verwalten/darstellung
 * 3. Privatsphäre anpassen → /verwalten/privatsphaere
 * 4. Seite verwalten → /verwalten/verwaltung
 */
export function SettingsHubCard({
  memorialId,
  className = '',
}: SettingsHubCardProps) {
  const menuItems: SettingsMenuItem[] = [
    {
      id: 'stammdaten',
      title: 'Stammdaten verwalten',
      icon: <StammdatenIcon size={24} className="text-primary" />,
      href: `/gedenkseite/${memorialId}/verwalten/stammdaten`,
    },
    {
      id: 'darstellung',
      title: 'Darstellung ändern',
      icon: <DarstellungIcon size={24} className="text-primary" />,
      href: `/gedenkseite/${memorialId}/verwalten/darstellung`,
    },
    {
      id: 'privatsphaere',
      title: 'Privatsphäre anpassen',
      icon: <PrivatsphaereIcon size={24} className="text-primary" />,
      href: `/gedenkseite/${memorialId}/verwalten/privatsphaere`,
    },
    {
      id: 'verwaltung',
      title: 'Seite verwalten',
      icon: <SettingsIcon className="w-6 h-6 text-primary" />,
      href: `/gedenkseite/${memorialId}/verwalten/verwaltung`,
    },
  ];

  return (
    <div
      className={`
        min-w-[247px] max-w-full aspect-square
        bg-bw-opacity-40 rounded-md shadow-card
        p-1 flex flex-col
        ${className}
      `}
    >
      {/* Inner container - no horizontal padding, half vertical padding */}
      <div className="w-full h-full rounded-sm bg-light-dark-mode py-2 flex flex-col">
        {/* Header */}
        <div className="flex items-center py-2 px-3 border-b border-main">
          <span className="text-webapp-body text-primary">Einstellungen</span>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="
                flex items-center justify-between py-3 px-3
                transition-colors duration-150
                hover:bg-bw-opacity-80
                text-primary
              "
            >
              <span className="text-body-s">{item.title}</span>
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
