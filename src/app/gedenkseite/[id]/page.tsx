import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { checkMemorialAccess, incrementMemorialViewCount } from '@/lib/utils/memorial-access';
import { createClient } from '@/lib/supabase/server';
import PublicMemorialCard from '@/components/memorial/PublicMemorialCard';
import ReactionsBar from '@/components/memorial/ReactionsBar';
import ObituarySection from '@/components/memorial/ObituarySection';
import { WissenswertesSection } from '@/components/memorial/WissenswertesSection';
import { KondolenzbuchSection } from '@/components/memorial/KondolenzbuchSection';
import { formatFullName } from '@/lib/utils/nameFormatter';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Public Memorial Page
 *
 * Displays a memorial page with privacy-level enforcement:
 * - Public memorials: Anyone can view
 * - Private memorials: Only creator or invited users
 *
 * MVP Features:
 * - Profile sidebar with avatar, dates, reactions
 * - Full obituary text
 * - View counter
 * - Privacy checks
 *
 * Future Features:
 * - Feed/Posts
 * - Events/Termine
 * - Memories Gallery
 * - Condolence Book
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Check access
  const { memorial, hasAccess } = await checkMemorialAccess(id, user?.id);

  if (!hasAccess || !memorial) {
    return {
      title: 'Gedenkseite nicht gefunden',
    };
  }

  const fullName = formatFullName(memorial);

  const birthYear = memorial.birth_date ? new Date(memorial.birth_date).getFullYear() : '';
  const deathYear = memorial.death_date ? new Date(memorial.death_date).getFullYear() : '';
  const years = birthYear && deathYear ? `(${birthYear} - ${deathYear})` : '';

  return {
    title: `${fullName} ${years} - Gedenkseite`,
    description: memorial.memorial_quote || memorial.obituary?.substring(0, 160) || `In liebevoller Erinnerung an ${fullName}`,
    openGraph: {
      title: `${fullName} ${years}`,
      description: memorial.memorial_quote || `In liebevoller Erinnerung an ${fullName}`,
      type: 'profile',
      images: memorial.avatar_url ? [{ url: memorial.avatar_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fullName} ${years}`,
      description: memorial.memorial_quote || `In liebevoller Erinnerung an ${fullName}`,
      images: memorial.avatar_url ? [memorial.avatar_url] : [],
    },
  };
}

export default async function MemorialPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Check memorial access
  const accessResult = await checkMemorialAccess(id, user?.id);

  // DEBUG: Log access check result
  console.log('[MemorialPage] Access check result:', {
    memorialId: id,
    userId: user?.id,
    hasAccess: accessResult.hasAccess,
    accessReason: accessResult.accessReason,
    privacyLevel: accessResult.memorial?.privacy_level,
    memorialExists: !!accessResult.memorial,
  });

  if (!accessResult.hasAccess || !accessResult.memorial) {
    console.error('[MemorialPage] Access denied:', {
      hasAccess: accessResult.hasAccess,
      memorial: !!accessResult.memorial,
      reason: accessResult.accessReason,
    });

    // If user is not authenticated and memorial is private, redirect to login
    if (!user && accessResult.accessReason === 'denied') {
      redirect(`/auth/login?redirect=/gedenkseite/${id}`);
    }
    // Otherwise show 404
    notFound();
  }

  const { memorial, userRole } = accessResult;

  // Increment view count for public memorials
  if (memorial.privacy_level === 'public') {
    // Fire and forget - don't await to avoid slowing page load
    incrementMemorialViewCount(id).catch(() => {
      // Silent fail - view count is not critical
    });
  }

  return (
    <div className="min-h-screen bg-light-dark-mode">
      {/* Main Content Container */}
      <div className="max-w-full lg:max-w-screen-2xl mx-auto p-3 lg:p-10">
        {/* Header Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-4 p-2 rounded-xl border border-red-500">
          {/* Left Column - Profile Sidebar (Sticky on desktop) */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <PublicMemorialCard memorial={memorial} />
          </aside>

          {/* Right Column - Content Area */}
          <main className="flex-1 max-w-3xl">
            <div className="flex flex-col gap-6">
              {/* Admin Controls (only for administrators) */}
              {userRole === 'administrator' && (
                <div className="bg-accent-light border border-accent rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-inter font-semibold text-[#1F2024] mb-1">
                      Verwaltungsmodus
                    </h3>
                    <p className="text-sm text-secondary">
                      Sie sind Administrator dieser Gedenkseite
                    </p>
                  </div>
                  <a
                    href={`/gedenkseite/${id}/verwalten`}
                    className="px-4 py-2 bg-interactive-primary-default hover:bg-interactive-primary-hover text-white rounded-lg font-inter font-semibold text-sm transition-colors"
                  >
                    Seite verwalten
                  </a>
                </div>
              )}

              {/* Obituary Section */}
              {memorial.obituary && <ObituarySection obituary={memorial.obituary} />}

              {/* Wissenswertes Section */}
              <WissenswertesSection memorialId={id} />

              {/* Empty State - No content yet */}
              {!memorial.obituary && (
                <div className="bg-white rounded-[20px] p-12 shadow border border-main text-center">
                  <div className="max-w-md mx-auto">
                    <svg
                      className="w-20 h-20 mx-auto mb-6 text-secondary opacity-40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    <h2 className="text-xl font-satoshi font-semibold text-primary mb-2">
                      Noch keine Inhalte
                    </h2>
                    <p className="text-secondary">
                      {userRole === 'administrator'
                        ? 'Sie können Inhalte wie Nachruf, Erinnerungen und Termine hinzufügen.'
                        : 'Der Verwalter hat noch keine weiteren Inhalte hinzugefügt.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Placeholder for future sections */}
              <div className="bg-light-dark-mode rounded-[20px] p-6 shadow border border-main">
                <div className="text-center py-8">
                  <p className="text-secondary text-sm">
                    Weitere Bereiche wie Erinnerungen und Termine folgen in Kürze.
                  </p>
                </div>
              </div>

              {/* View Count Display */}
              {memorial.view_count !== undefined && memorial.view_count > 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-tertiary">
                    Diese Gedenkseite wurde {memorial.view_count.toLocaleString('de-DE')} Mal besucht
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Reaktionen - temporär mit border-red-500, außerhalb des Haupt-Containers */}
        <div className="w-full lg:w-[427px] mt-4 border border-red-500 pt-4 px-2">
          <ReactionsBar memorialId={id} />
        </div>

        {/* Kondolenzbuch Section */}
        <KondolenzbuchSection
          memorialId={id}
          memorialData={{
            firstName: memorial.first_name,
            lastName: memorial.last_name,
            avatarUrl: memorial.avatar_url,
            avatarType: memorial.avatar_type as 'initials' | 'image',
          }}
          isAuthenticated={!!user}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}
