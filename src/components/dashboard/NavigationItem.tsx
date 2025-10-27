import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BadgeConfig {
  text: string;
  bgColor: string;
  textColor: string;
}

interface NavigationItemProps {
  /** Navigation target URL */
  href: string;
  /** Icon element (React Node) */
  icon: React.ReactNode;
  /** Label text */
  label: string;
  /** Whether this item is currently active */
  isActive: boolean;
  /** Optional badge/chip configuration */
  badge?: BadgeConfig;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * NavigationItem - Sidebar navigation link component
 *
 * Features:
 * - Consistent layout with icon, label, and optional badge
 * - Active, hover, and inactive states
 * - Fully accessible with Next.js Link
 * - Smooth transitions
 */
export default function NavigationItem({
  href,
  icon,
  label,
  isActive,
  badge,
  className,
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        // Layout - all items left-aligned
        "flex items-center gap-3 p-1 rounded-lg",
        "text-desktop-body-s",

        // Transitions
        "transition-colors duration-200",

        // State-based styling
        isActive && [
          "bg-bw",
        ],
        !isActive && [
          "hover:bg-primary",
          "text-interactive-disabled", // Inactive text color
        ],

        className
      )}
    >
      {/* Icon - fixed width for consistency */}
      <span
        className={cn(
          "w-6 h-6 flex items-center justify-center flex-shrink-0",
          isActive ? "text-primary" : "text-interactive-disabled"
        )}
      >
        {icon}
      </span>

      {/* Label */}
      <span className={cn(
        isActive ? "text-primary" : "text-interactive-disabled"
      )}>
        {label}
      </span>

      {/* Optional Badge/Chip */}
      {badge && (
        <span
          className="px-2 py-0.5 rounded-xs text-[0.75rem] font-semibold"
          style={{
            backgroundColor: badge.bgColor,
            color: badge.textColor,
          }}
        >
          {badge.text}
        </span>
      )}
    </Link>
  );
}
