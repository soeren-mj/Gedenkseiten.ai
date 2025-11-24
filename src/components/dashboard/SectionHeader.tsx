interface SectionHeaderProps {
  children: string;
}

/**
 * SectionHeader Component
 *
 * Used for section headings in the sidebar (e.g., "Gedenkseiten-Inhalte", "Einstellungen").
 * Uses design system class text-webapp-group (14px Semi Bold).
 */
export const SectionHeader = ({ children }: SectionHeaderProps) => {
  return (
    <h5 className="text-webapp-group text-tertiary mb-2 mt-6">
      {children}
    </h5>
  );
};
