'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import { ThemeModeToggle } from '@/components/ui/theme-mode-toggle';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

interface BackendHeaderProps {
  actionLabel?: string;
}

export default function BackendHeader({ actionLabel }: BackendHeaderProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Active state when on dashboard main page
  const isDashboardActive = pathname === '/dashboard';

  // Extract memorial ID from path if on a gedenkseite page
  const memorialId = useMemo(() => {
    const match = pathname.match(/\/gedenkseite\/([^/]+)/);
    return match ? match[1] : undefined;
  }, [pathname]);

  return (
    <header className="w-full px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Logo + Dashboard Link */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1">
            <Image
              src="/images/logo-gedenkseiten.ai-white-x4.png"
              alt="Gedenkseiten.ai"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-primary font-satoshi text-xl font-medium">
              Gedenkseiten.ai
            </span>
          </Link>

          {/* Dashboard Link with Avatar */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 py-0.5 pl-0.5 pr-2 rounded-full bg-transparent hover:bg-bw-opacity-60 active:bg-transparent border-[0.5px] transition-all ${
              isDashboardActive
                ? 'border-active'
                : 'border-transparent active:border-active'
            }`}
          >
            <InitialsAvatar
              name={user?.name || user?.email || 'U'}
              size="sm"
              imageUrl={user?.avatar_url}
            />
            <span className="text-primary font-medium text-webapp-group">
              Mein Dashboard
            </span>
          </Link>

          {/* Action Label (optional) */}
          {actionLabel && (
            <>
              <span className="text-tertiary text-body-m">|</span>
              <span className="text-primary font-medium text-webapp-group">
                {actionLabel}
              </span>
            </>
          )}
        </div>

        {/* Right: Notifications + Theme Toggle */}
        <div className="flex items-center gap-2">
          <NotificationBell memorialId={memorialId} />
          <ThemeModeToggle />
        </div>
      </div>
    </header>
  );
}
