import { Button } from '@/components/ui/Button';

/**
 * ContentOption Component
 *
 * Displays a content option (e.g., Spruch, Kondolenzbuch) with title, description, badge, and action button.
 * Used in both Summary page and Memorial Management page for consistent styling.
 */
export interface ContentOptionProps {
  title: string;
  description: string;
  badge?: 'EMPFEHLUNG' | 'PREMIUM';
  buttonText: string;
  disabled?: boolean;
  premium?: boolean;
  onAction?: () => void;
}

export function ContentOption({
  title,
  description,
  badge,
  buttonText,
  disabled,
  premium,
  onAction,
}: ContentOptionProps) {
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-webapp-group text-primary">{title}</p>
          {badge && (
            <span
              className={`px-2 py-1 text-chip rounded-full ${
                badge === 'EMPFEHLUNG'
                  ? 'bg-chip-empfehlung text-chip-empfehlung'
                  : 'bg-chip-premium text-chip-premium'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-body-s text-secondary">{description}</p>
      </div>
      <Button variant="secondary" size="xs" disabled={disabled} onClick={onAction}>
        {buttonText}
      </Button>
    </div>
  );
}
