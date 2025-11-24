/**
 * Layout for memorial creation flow
 *
 * This layout removes the header and footer that appear in the root layout,
 * providing a clean wizard experience.
 */
export default function GedenkseiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
