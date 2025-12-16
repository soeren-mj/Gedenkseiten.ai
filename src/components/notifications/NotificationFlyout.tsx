'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import type { Database, Notification, NotificationType } from '@/lib/supabase';
import { NotificationCard } from './NotificationCard';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';

interface NotificationWithMemorial extends Notification {
  memorial_name?: string | null;
}

interface NotificationFlyoutProps {
  onNotificationsRead: () => void;
  memorialId?: string;
}

// Footer button configuration
const FOOTER_BUTTONS: {
  type: NotificationType;
  label: string;
  path: string;
  enabled: boolean;
}[] = [
  { type: 'reaction', label: 'Reaktionen', path: 'reaktionen', enabled: true },
  { type: 'kondolenz', label: 'Kondolenzen', path: 'kondolenzbuch', enabled: false },
  { type: 'beitrag', label: 'Beiträge', path: 'beitraege', enabled: false },
];

/**
 * NotificationFlyout - Dropdown list of notifications
 *
 * Features:
 * - Shows up to 5 notifications
 * - "Alle als gelesen markieren" action
 * - Footer buttons for navigation (when memorialId is provided)
 * - Click notification to navigate to detail page
 */
export function NotificationFlyout({ onNotificationsRead, memorialId }: NotificationFlyoutProps) {
  const [notifications, setNotifications] = useState<NotificationWithMemorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({
        limit: '5',
        unread_only: 'true',
      });

      // Filter by memorial if provided
      if (memorialId) {
        params.set('memorial_id', memorialId);
      }

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data.notifications);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [memorialId]);

  // Mark single notification as read
  const handleNotificationRead = async (notification: NotificationWithMemorial) => {
    if (notification.is_read) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`/api/notifications/${notification.id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
      onNotificationsRead();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams();
      if (memorialId) {
        params.set('memorial_id', memorialId);
      }

      await fetch(`/api/notifications/read-all?${params}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      onNotificationsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Count notifications by type
  const getCountByType = (type: NotificationType): number => {
    return notifications.filter(n => n.type === type && !n.is_read).length;
  };

  // Generate href for notification
  const getNotificationHref = (notification: NotificationWithMemorial): string | undefined => {
    if (!notification.memorial_id) return undefined;

    const pathMap: Record<NotificationType, string> = {
      reaction: 'reaktionen',
      kondolenz: 'kondolenzbuch',
      beitrag: 'beitraege',
    };

    return `/gedenkseite/${notification.memorial_id}/verwalten/${pathMap[notification.type]}`;
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-interactive-info border border-interactive-hover rounded-md shadow-card backdrop-blur-md p-1 z-50">
      <div className="max-h-[500px] bg-interactive-info rounded-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-hover">
          <h3 className="text-webapp-body text-primary">Neue Aktivitäten</h3>
          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAllRead}
              className="text-body-xs text-interactive-info hover:underline disabled:opacity-50"
            >
              {isMarkingAllRead ? 'Wird markiert...' : 'Alle als gelesen markieren'}
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-interactive-primary-default border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-tertiary">
                  <path
                    d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <p className="text-body-m text-secondary">Keine Benachrichtigungen</p>
              <p className="text-body-s text-tertiary mt-1">
                Du hast keine neuen Aktivitäten.
              </p>
            </div>
          ) : (
            <div className="">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  href={getNotificationHref(notification)}
                  onRead={() => handleNotificationRead(notification)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Buttons - only show when memorialId is provided */}
        {memorialId && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-hover">
            {FOOTER_BUTTONS.map((button) => {
              const count = getCountByType(button.type);
              const hasNotifications = count > 0;
              const href = `/gedenkseite/${memorialId}/verwalten/${button.path}`;

              if (!button.enabled) {
                // Disabled state for features not yet implemented
                return (
                  <span
                    key={button.type}
                    className="flex items-center gap-1 text-button-xs text-interactive-disabled cursor-not-allowed"
                  >
                    {button.label}
                    <ChevronRightIcon size={12} />
                  </span>
                );
              }

              return (
                <Link
                  key={button.type}
                  href={href}
                  className={`flex items-center gap-1 text-button-xs transition-colors hover:underline ${
                    hasNotifications ? 'text-link-default' : 'text-secondary'
                  }`}
                >
                  {hasNotifications && (
                    <span className="font-semibold">{count}</span>
                  )}
                  <span>{button.label}</span>
                  <ChevronRightIcon size={12} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationFlyout;
