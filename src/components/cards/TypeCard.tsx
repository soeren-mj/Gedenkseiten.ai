'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

/**
 * TypeCard Component - Memorial type selection card with hero image
 *
 * Used in the wizard to select memorial type (Person, Tier, Familie, Ereignis)
 */
interface TypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
  imageUrl?: string;
}

export default function TypeCard({
  icon,
  title,
  description,
  onClick,
  disabled,
  badge,
  imageUrl
}: TypeCardProps) {
  return (
    <div className="relative h-full">
      {/* Badge Overlay - outside opacity container */}
      {badge && disabled && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="yellow">{badge}</Badge>
        </div>
      )}

      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-full flex flex-col items-start justify-start relative overflow-hidden rounded-md shadow-card p-1 bg-bw-opacity-80 transition-all text-left
          ${
            disabled
              ? 'border-main cursor-not-allowed opacity-40'
              : 'border-main hover:border-interactive-primary-default hover:shadow-lg cursor-pointer'
          }
        `}
      >
        {/* Hero Image */}
        <div className="relative h-44 w-full overflow-hidden rounded-t-sm rounded-b-none bg-primary">
          {imageUrl ? (
            <div
              className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-tertiary">
              <div className="text-secondary opacity-50">
                {icon}
              </div>
            </div>
          )}

          {/* Badge Overlay - for non-disabled cards */}
          {badge && !disabled && (
            <div className="absolute top-3 right-3">
              <Badge variant="yellow">{badge}</Badge>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="px-2 pb-2 pt-4 w-full">
          {/* Title with Icon */}
          <div className="flex items-center justify-between">
            <h3 className="text-webapp-body text-primary">{title}</h3>
            <div className="text-primary w-8 h-8">
              {icon}
            </div>
          </div>

          {/* Description */}
          <p className="text-body-s text-secondary">{description}</p>
        </div>
      </button>
    </div>
  );
}
