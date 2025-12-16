'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client-legacy';
import StammdatenIcon from '@/components/icons/StammdatenIcon';
import DarstellungIcon from '@/components/icons/DarstellungIcon';
import PrivatsphaereIcon from '@/components/icons/PrivatsphaereIcon';
import LogoutIcon from '@/components/icons/LogoutIcon';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  memorialId: string;
}

interface SettingsMenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

/**
 * SettingsOverlay Component
 *
 * Dropdown overlay for memorial settings positioned next to the button.
 * Opens to the left and upward from the trigger button.
 *
 * Options:
 * 1. Stammdaten verwalten → /verwalten/stammdaten
 * 2. Darstellung ändern → /verwalten/darstellung
 * 3. Privatsphäre Einstellungen → /verwalten/privatsphaere
 * 4. Abmelden (Logout-Action)
 */
export function SettingsOverlay({
  isOpen,
  onClose,
  memorialId,
}: SettingsOverlayProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const menuItems: SettingsMenuItem[] = [
    {
      id: 'stammdaten',
      title: 'Stammdaten verwalten',
      icon: <StammdatenIcon size={20} className="text-primary" />,
      href: `/gedenkseite/${memorialId}/verwalten/stammdaten`,
    },
    {
      id: 'darstellung',
      title: 'Darstellung ändern',
      icon: <DarstellungIcon size={20} className="text-primary" />,
      href: `/gedenkseite/${memorialId}/verwalten/darstellung`,
    },
    {
      id: 'privatsphaere',
      title: 'Privatsphäre Einstellungen',
      icon: <PrivatsphaereIcon size={20} className="text-primary" />,
      href: `/gedenkseite/${memorialId}/verwalten/privatsphaere`,
    },
    {
      id: 'logout',
      title: 'Abmelden',
      icon: <LogoutIcon size={20} className="text-accent-red" />,
      onClick: handleLogout,
      variant: 'danger',
    },
  ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Transparent backdrop for click-outside-to-close */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
      />

      {/* Dropdown positioned bottom-0 left-full (left of button, aligned to bottom) */}
      <div className="absolute bottom-0 left-[12rem] -bottom-[2.5rem] mr-2 z-50">
        {/* Frame effect - outer container */}
        <div className="bg-bw-opacity-40 rounded-md shadow-card backdrop-blur-md p-1">
          {/* Inner container */}
          <div className="rounded-sm bg-secondary min-w-[280px] overflow-hidden">

            {/* Menu Items */}
            <div className="flex flex-col">
              {menuItems.map((item) => {
                const baseClasses = `
                  flex items-center justify-between py-2 px-3
                  transition-colors duration-150
                  hover:bg-primary
                  ${item.variant === 'danger' ? 'text-accent-red' : 'text-primary'}
                `;

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={baseClasses}
                      onClick={onClose}
                    >
                      <span className="text-body-s">{item.title}</span>
                      {item.icon}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick?.();
                      onClose();
                    }}
                    className={`${baseClasses} w-full text-left`}
                  >
                    <span className="text-body-s">{item.title}</span>
                    {item.icon}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
