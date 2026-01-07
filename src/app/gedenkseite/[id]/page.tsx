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
import Link from 'next/link';

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

  // Fetch user profile data if authenticated
  let userProfile: { name: string | null; avatar_url: string | null } | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();
    userProfile = profile;
  }

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

  // Fetch Wissenswertes server-side
  const { data: wissenswertes } = await supabase
    .from('wissenswertes')
    .select('*')
    .eq('memorial_id', id)
    .order('order_index', { ascending: true });

  // Check if Kondolenzbuch exists
  const { data: condolenceBook } = await supabase
    .from('condolence_books')
    .select('id')
    .eq('memorial_id', id)
    .single();

  // Layout logic
  const hasObituary = !!memorial.obituary;
  const hasWissenswertes = (wissenswertes?.length ?? 0) > 0;
  const hasCondolenceBook = !!condolenceBook;
  const hasBothMainContent = hasObituary && hasWissenswertes;

  // Kondolenzbuch position: in Right Column unless both Nachruf AND Wissenswertes exist
  const showKondolenzbuchInRightColumn = hasCondolenceBook && !hasBothMainContent;
  const showKondolenzbuchBelow = hasCondolenceBook && hasBothMainContent;

  // Empty state only when nothing exists
  const showEmptyState = !hasObituary && !hasWissenswertes && !hasCondolenceBook;

  // Increment view count for all memorials (public and private)
  // Fire and forget - don't await to avoid slowing page load
  incrementMemorialViewCount(id).catch(() => {
    // Silent fail - view count is not critical
  });

  return (
    <div className="min-h-screen bg-light-dark-mode">
      {/* Main Content Container */}
      <div className="max-w-full lg:max-w-screen-2xl mx-auto p-3 lg:p-10">
        {/* Admin Controls (only for administrators) */}
        {userRole === 'administrator' && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-interactive-primary-default shrink-0" />
            <p className="text-sm text-secondary">
              Du bist Administrator dieser Gedenkseite.{' '}
              <a
                href={`/gedenkseite/${id}/verwalten`}
                className="underline hover:text-primary transition-colors"
              >
                Seite verwalten
              </a>
            </p>
          </div>
        )}

        {/* Header Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-4 p-2 rounded-xl bg-bw border border-red-500">
          {/* Left Column - Profile Sidebar (Sticky on desktop) */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <PublicMemorialCard memorial={memorial} />
          </aside>

          {/* Right Column - Content Area */}
          <main className="flex-1">
            <div className="flex flex-col gap-6 h-full items-center justify-center">
              {/* Obituary Section */}
              {hasObituary && <ObituarySection obituary={memorial.obituary!} />}

              {/* Wissenswertes Section */}
              {hasWissenswertes && <WissenswertesSection items={wissenswertes!} />}

              {/* Kondolenzbuch in Right Column (when not both Nachruf AND Wissenswertes) */}
              {showKondolenzbuchInRightColumn && (
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
                  userName={userProfile?.name || undefined}
                  userAvatar={userProfile?.avatar_url}
                />
              )}

              {/* Empty State - only when no content at all */}
              {showEmptyState && (
                <div className="h-full w-full flex items-center justify-center bg-primary rounded-lg p-10">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-primary">
                      Noch keine Inhalte.
                    </h3>
                    <p className="text-subsection-h3 text-secondary mb-1">
                      {userRole === 'administrator'
                        ? 'Füge Inhalte wie einen Spruch und Nachruf, Wissenswertes ein digitales Kondolenzbuch und Termine hinzu.'
                        : 'Der Verwaltende hat noch keine weiteren Inhalte zu dieser Gedenkseite hinzugefügt.'}
                    </p>
                    {userRole === 'administrator' && (
                      <Link
                        href={`/gedenkseite/${id}/verwalten`}
                        className="mt-4 text-button-m text-interactive-default inline-flex items-center justify-center py-3 px-4 rounded-xs bg-interactive-primary-default hover:bg-interactive-primary-hover transition-all duration-200"
                      >
                        Inhalte hinzufügen
                      </Link>
                    )}
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>

        {/* Reaktionen - temporär mit border-red-500, außerhalb des Haupt-Containers */}
        <div className="w-full lg:px-6 mt-5 border border-red-500">
          <ReactionsBar memorialId={id} />
        </div>

        {/* Kondolenzbuch Section (below layout - only when both Nachruf AND Wissenswertes exist) */}
        {showKondolenzbuchBelow && (
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
            userName={userProfile?.name || undefined}
            userAvatar={userProfile?.avatar_url}
          />
        )}

        {/* View Count Display */}
        {memorial.view_count !== undefined && memorial.view_count > 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-tertiary">
              Diese Gedenkseite wurde {memorial.view_count.toLocaleString('de-DE')} Mal besucht
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
