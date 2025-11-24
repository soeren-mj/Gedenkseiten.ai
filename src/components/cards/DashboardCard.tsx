import React from 'react';

interface DashboardCardProps {
  headline: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  clickable?: boolean;
  className?: string;
}

/**
 * DashboardCard Component
 *
 * Responsive square card for memorial management dashboard.
 * Size:
 * - Mobile: 158px × 158px
 * - Desktop: 247px × 247px
 * Background: Translucent with backdrop blur
 * Typography:
 * - Mobile: Headline text-webapp-group (15px), Description text-body-xs (12px)
 * - Desktop: Headline text-webapp-body (17px), Description text-body-m (15px)
 *
 * Used for:
 * - Profile Progress (avatar with circular indicator)
 * - Visitor Counter (display number)
 * - View Page Link (arrow icon)
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  headline,
  description,
  icon,
  onClick,
  href,
  clickable = false,
  className = '',
}) => {
  const isInteractive = clickable || onClick || href;

  const baseClasses = `
    w-[158px] h-[158px] sm:w-[247px] sm:h-[247px]
    bg-bw-opacity-40 backdrop-blur-sm
    rounded-lg
    p-3 sm:p-6 overflow-hidden
    flex flex-col gap-2 sm:gap-4
    ${isInteractive ? 'cursor-pointer hover:bg-bw-opacity-60 hover:scale-[1.02] transition-all duration-200' : 'cursor-default'}
    ${className}
  `;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.open(href, '_blank');
    }
  };

  const content = (
    <>
      {/* Icon/Visual Element */}
      <div className={`w-full flex items-center ${isInteractive ? 'justify-end' : 'justify-start'}`}>
        {icon}
      </div>

      {/* Text Content */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Headline - max 2 lines */}
        <h3 className="text-webapp-group sm:text-webapp-body text-primary text-left line-clamp-2">
          {headline}
        </h3>

        {/* Description - truncated with ellipsis */}
        <p className="text-body-xs sm:text-body-m text-secondary text-left line-clamp-3">
          {description}
        </p>
      </div>
    </>
  );

  if (isInteractive) {
    return (
      <button
        onClick={handleClick}
        className={baseClasses}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  );
};
