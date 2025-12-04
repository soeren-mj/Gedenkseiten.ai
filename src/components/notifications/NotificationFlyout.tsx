'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Database, Notification, NotificationType } from '@/lib/supabase';
import { NotificationCard } from './NotificationCard';

interface NotificationWithMemorial extends Notification {
  memorial_name?: string | null;
}

interface NotificationFlyoutProps {
  onNotificationsRead: () => void;
}

const TABS: { value: NotificationType | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'reaction', label: 'Reaktionen' },
  { value: 'kondolenz', label: 'Kondolenzen' },
  { value: 'beitrag', label: 'Beiträge' },
];

/**
 * NotificationFlyout - Dropdown list of notifications
 *
 * Features:
 * - Tabs for filtering by type
 * - "Alle als gelesen markieren" action
 * - Scrollable notification list
 * - Click notification to mark as read
 */
export function NotificationFlyout({ onNotificationsRead }: NotificationFlyoutProps) {
  const [notifications, setNotifications] = useState<NotificationWithMemorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NotificationType | 'all'>('all');
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
        limit: '20',
        unread_only: 'false',
      });

      if (activeTab !== 'all') {
        params.set('type', activeTab);
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
  }, [activeTab]);

  // Mark single notification as read
  const handleNotificationClick = async (notification: NotificationWithMemorial) => {
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
      if (activeTab !== 'all') {
        params.set('type', activeTab);
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

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className="absolute right-0 top-full mt-2 w-[400px] max-h-[500px] bg-bw rounded-lg shadow-xl border border-main z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-main">
        <h3 className="text-body-l font-semibold text-primary">Neue Aktivitäten</h3>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead}
            className="text-body-s text-interactive-primary-default hover:underline disabled:opacity-50"
          >
            {isMarkingAllRead ? 'Wird markiert...' : 'Alle als gelesen markieren'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-main px-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              px-4 py-2 text-body-s font-medium transition-colors relative
              ${activeTab === tab.value
                ? 'text-interactive-primary-default'
                : 'text-secondary hover:text-primary'
              }
            `}
          >
            {tab.label}
            {activeTab === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-interactive-primary-default" />
            )}
          </button>
        ))}
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
              {activeTab === 'all'
                ? 'Du hast keine neuen Aktivitäten.'
                : `Keine ${TABS.find(t => t.value === activeTab)?.label || ''} vorhanden.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-main">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationFlyout;
