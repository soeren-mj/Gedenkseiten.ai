'use client';

import React, { useState } from 'react';

export interface ObituarySectionProps {
  obituary: string | null;
  className?: string;
}

/**
 * ObituarySection Component
 *
 * Displays the full obituary text in the content area
 * Expandable if text is longer than a certain threshold
 *
 * MVP version: Simple expand/collapse functionality
 * Future: Rich text formatting, images, etc.
 */
export const ObituarySection: React.FC<ObituarySectionProps> = ({
  obituary,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!obituary) {
    return null;
  }

  // Show expand button if obituary is longer than 500 characters
  const shouldShowExpand = obituary.length > 500;
  const displayText = shouldShowExpand && !isExpanded
    ? obituary.substring(0, 500) + '...'
    : obituary;

  return (
    <section
      id="obituary-section"
      className={`bg-white rounded-[20px] p-6 lg:p-8 shadow border border-main ${className}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[1.5rem] lg:text-[1.75rem] font-satoshi font-semibold text-[#1F2024]">
          Nachruf
        </h2>
      </div>

      {/* Obituary Content */}
      <div className="prose prose-lg max-w-none">
        <p className="text-[1rem] lg:text-[1.125rem] text-[#4D4E59] leading-[1.7] whitespace-pre-wrap">
          {displayText}
        </p>
      </div>

      {/* Expand/Collapse Button */}
      {shouldShowExpand && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-[0.875rem] text-interactive-primary-default hover:text-interactive-primary-hover flex items-center gap-2 font-inter font-semibold transition-colors"
        >
          {isExpanded ? 'Weniger anzeigen' : 'Mehr lesen'}
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path
              d="M2.07494 5.86947L2.90411 5.04297L8.51094 10.6498L14.1134 5.04297L14.9468 5.86947L8.51094 12.3053L2.07494 5.86947Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
    </section>
  );
};

export default ObituarySection;
