import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface MenuPowerLinkProps {
  /** Navigation target URL (for Link mode) */
  href?: string;
  /** Click handler (for Button mode) */
  onClick?: () => void;
  /** Main headline text (body-xs semibold) */
  headline: string;
  /** Optional subline text (body-xs regular) */
  subline?: string;
  /** Icon element displayed on the right */
  icon: React.ReactNode;
  /** Show top border (for items like "Abmelden") */
  showTopBorder?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * MenuPowerLink - Sidebar menu link component for prominent actions
 *
 * A flexible card-like component that renders as either a link or button.
 * Used for important actions like "Memorial Journey teilen", "Premium Account",
 * "Hilfe und Support", and "Abmelden".
 *
 * Features:
 * - Renders as Link when href is provided, or Button when onClick is provided
 * - Headline with body-xs semibold typography
 * - Optional subline with body-xs regular typography
 * - Icon positioned on the right, vertically centered
 * - Optional top border for visual separation
 * - Hover and active states
 * - Full width, height hugs content
 * - 12px border radius (rounded-xs)
 *
 * @example
 * // As Link (navigation)
 * <MenuPowerLink
 *   href="/premium"
 *   headline="Premium Account"
 *   subline="Erlebe die Vorteile des Premium Accounts heraus"
 *   icon={<GiftIcon />}
 * />
 *
 * @example
 * // As Button (action/modal)
 * <MenuPowerLink
 *   onClick={() => handleShare()}
 *   headline="Memorial Journey teilen"
 *   subline="Lade Personen zu deinen Gedenkseiten ein"
 *   icon={<ShareIcon />}
 * />
 *
 * @example
 * // As Button with top border
 * <MenuPowerLink
 *   onClick={() => handleLogout()}
 *   headline="Abmelden"
 *   icon={<LogoutIcon />}
 *   showTopBorder
 * />
 */
export const MenuPowerLink = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  MenuPowerLinkProps
>(({ href, onClick, headline, subline, icon, showTopBorder = false, className }, ref) => {
  // Shared styles for both Link and Button
  const sharedClassName = cn(
    // Layout
    'flex items-center gap-3 w-full',

    // Text alignment (important for button elements)
    'text-left',

    // Spacing
    'p-4',

    // Border radius
    'rounded-xs',

    // Optional top border
    showTopBorder && 'border-t border-main',

    // Interactive states
    'transition-colors duration-200',
    'hover:bg-bw-opacity-60',
    'active:bg-bw-opacity-80',

    className
  );

  // Shared content JSX
  const content = (
    <>
      {/* Left: Text content */}
      <div className="flex-1 min-w-0">
        {/* Headline */}
        <div className="text-webapp-group text-primary">
          {headline}
        </div>

        {/* Optional Subline */}
        {subline && (
          <div className="text-body-xs text-secondary mt-0.5">
            {subline}
          </div>
        )}
      </div>

      {/* Right: Icon */}
      <div className="flex-shrink-0 text-primary">
        {icon}
      </div>
    </>
  );

  // Render as Link if href is provided
  if (href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={sharedClassName}
      >
        {content}
      </Link>
    );
  }

  // Render as Button if onClick is provided
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      onClick={onClick}
      className={sharedClassName}
      type="button"
    >
      {content}
    </button>
  );
});

MenuPowerLink.displayName = 'MenuPowerLink';

export default MenuPowerLink;
