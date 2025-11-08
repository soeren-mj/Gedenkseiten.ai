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
 * - Active and hover states
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
        "text-webapp-group",

        // Transitions
        "transition-colors duration-200",

        // State-based styling
        isActive && "bg-bw",
        !isActive && "hover:bg-bw-opacity-60",

        className
      )}
    >
      {/* Icon - fixed width for consistency */}
      <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-primary">
        {icon}
      </span>

      {/* Label */}
      <span className="text-webapp-group text-primary">
        {label}
      </span>

      {/* Optional Badge/Chip */}
      {badge && (
        <span
          className="p-1 rounded-xs text-chip font-semibold"
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
