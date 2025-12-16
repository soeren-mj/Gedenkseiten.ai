'use client';

import { useRouter } from 'next/navigation';
import { useMemorial } from '@/contexts/MemorialContext';
import { formatFullName } from '@/lib/utils/nameFormatter';
import Button from '@/components/ui/Button';
import BellNotificationIcon from '@/components/icons/BellNotificationIcon';

/**
 * Notifications Page (Placeholder)
 *
 * Shows notifications for a memorial page (reactions, condolences, etc.)
 * Currently a placeholder - full implementation coming soon.
 */
export default function NotificationsPage() {
  const router = useRouter();
  const { memorial } = useMemorial();

  const displayName = formatFullName(memorial);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-webapp-title text-primary mb-2">
          Benachrichtigungen
        </h1>
        <p className="text-body-m text-secondary">
          Benachrichtigungen für {displayName}
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="flex flex-col items-center justify-center py-16 px-8 bg-secondary rounded-lg">
        <BellNotificationIcon className="w-16 h-16 text-tertiary mb-6" />
        <h2 className="text-subsection-h3 text-primary mb-2 text-center">
          Kommt bald
        </h2>
        <p className="text-body-m text-secondary text-center max-w-md mb-8">
          Hier wirst du bald alle Reaktionen, Kondolenzen und weitere Aktivitäten
          für diese Gedenkseite sehen können.
        </p>
        <Button
          variant="secondary"
          onClick={() => router.push(`/gedenkseite/${memorial.id}/verwalten`)}
        >
          Zurück zur Übersicht
        </Button>
      </div>
    </div>
  );
}
