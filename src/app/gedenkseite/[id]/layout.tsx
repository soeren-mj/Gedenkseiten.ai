/**
 * Memorial Page Layout
 *
 * Simple passthrough layout for public memorial pages.
 * This prevents the management layout (verwalten/layout.tsx) from being
 * applied to public memorial pages due to Next.js layout inheritance.
 *
 * This layout ensures:
 * - Public memorial pages (/gedenkseite/[id]) have clean layout
 * - Management pages (/gedenkseite/[id]/verwalten) keep their sidebar layout
 * - Navbar and Footer are visible (controlled by ConditionalLayout)
 */
export default function MemorialPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
