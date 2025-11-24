'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Reactions from '../ui/Reactions';
import { InitialsPreview } from './InitialsPreview';
import { MEMORIAL_REACTIONS, type Reaction } from '@/constants/reactionIcons';
import { Database } from '@/lib/supabase';
import { formatFullName } from '@/lib/utils/nameFormatter';

type Memorial = Database['public']['Tables']['memorials']['Row'];

export interface MemorialProfileSidebarProps {
  memorial: Memorial;
  reactions?: Reaction[];
  className?: string;
}

/**
 * MemorialProfileSidebar Component
 *
 * Left sidebar profile section for public memorial pages
 * Displays memorial profile information, reactions, and obituary preview
 *
 * Based on screenshots from:
 * docs/Screenshots-Flow-neue-Gedenkseite/Flows-neue-Gedenkseite/gedenkseite/_id/
 */
export const MemorialProfileSidebar: React.FC<MemorialProfileSidebarProps> = ({
  memorial,
  reactions: initialReactions = MEMORIAL_REACTIONS,
  className = '',
}) => {
  const isAnimal = memorial.type === 'animal';

  // Internal state for reactions
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);

  // Handle reaction clicks client-side
  const handleReactionClick = (reaction: Reaction) => {
    // TODO: Send reaction to API
    // For now, just update local state
    setReactions(prev =>
      prev.map(r =>
        r.key === reaction.key
          ? { ...r, value: r.value + 1 }
          : r
      )
    );
  };

  // Format dates (DD.MM.YYYY)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const birthDate = formatDate(memorial.birth_date);
  const deathDate = formatDate(memorial.death_date);

  // Avatar URL or fallback
  const avatarUrl = memorial.avatar_url || (isAnimal ? '/images/gedenkseite-tier.png' : '/images/profil-gedenkseite-jaune-pieree-mont-dereville.png');

  // Full name using formatFullName utility
  const fullName = formatFullName(memorial);

  return (
    <div className={`w-full lg:w-[427px] bg-white rounded-[28px] p-2 flex flex-col gap-8 shadow border border-main ${className}`}>
      {/* Avatar + Badge */}
      <div className="flex flex-col items-end">
        <div className="w-full aspect-square relative">
          {memorial.avatar_type === 'initials' ? (
            <div className="w-full h-full flex items-center justify-center bg-interactive-primary-default rounded-[20px]">
              <InitialsPreview
                firstName={memorial.first_name || ''}
                lastName={memorial.last_name || ''}
                size={200}
              />
            </div>
          ) : (
            <Image
              src={avatarUrl}
              alt={isAnimal ? `Profilbild ${memorial.first_name}` : `Profilbild ${memorial.first_name} ${memorial.last_name}`}
              fill
              className="rounded-[20px] object-cover"
              priority
            />
          )}
        </div>

        {/* NV Badge (Nicht Verifiziert) - shown by default, can be hidden for verified memorials */}
        <div className="-mt-6 mr-2 px-3 py-1 bg-gradient-to-r from-[#D1D1D6] to-[#A8A8AD] rounded-tl-[6px] rounded-br-[20px] flex items-center gap-2 shadow text-xs">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="6" fill="#D9D9D9" />
            <rect x="1" y="1" width="10" height="10" rx="5" fill="#F5F5F5" />
          </svg>
          <span className="text-white font-inter font-semibold uppercase tracking-wider">NV</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 px-2">
        {/* Name and dates */}
        <div>
          <div className="flex flex-col gap-2">
            {/* Name */}
            <h1 className="font-satoshi font-medium text-[2rem] leading-[1.2] tracking-[-0.09375rem] text-black whitespace-pre-line">
              {fullName}
            </h1>

            {/* Animal breed info */}
            {isAnimal && (memorial.animal_type_id || memorial.breed_group_id || memorial.breed_id) && (
              <div className="flex gap-2 items-center text-[1rem] font-inter font-semibold text-[#4D4E59]">
                {/* Note: Breed info would be fetched via join query in parent component */}
                <span>Tierinformationen verfügbar</span>
              </div>
            )}

            {/* Birth/Death dates */}
            <div className="flex flex-col gap-1 text-[14px] text-[#636573] font-inter">
              {birthDate && (
                <div className="flex gap-2 items-center">
                  <span>*</span>
                  <span>{birthDate}</span>
                  {memorial.birth_place && <span>{memorial.birth_place}</span>}
                </div>
              )}
              {deathDate && (
                <div className="flex gap-2 items-center">
                  <span>†</span>
                  <span>{deathDate}</span>
                  {memorial.death_place && <span>{memorial.death_place}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Gedenkspruch (Callout) */}
          {memorial.callout_text && (
            <div className="mt-6 font-inter text-[1.25rem] leading-[1.35] tracking-[-0.0075rem] text-[#4D4E59] italic">
              &ldquo;{memorial.callout_text}&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* Reactions */}
      <div className="border-t border-b border-main py-4 px-5 flex flex-col gap-4">
        <div className="text-[14px] font-inter font-semibold text-[#1F2024]">Reaktionen</div>
        <Reactions
          reactions={reactions}
          onReactionClick={handleReactionClick}
        />
      </div>

      {/* Nachruf Preview (if exists) */}
      {memorial.obituary && (
        <div className="flex flex-col gap-2 px-2 pb-2">
          <h2 className="text-[1.25rem] font-inter font-semibold text-[#1F2024]">Nachruf</h2>
          <div className="text-[1rem] text-[#4D4E59] leading-[1.55] line-clamp-4">
            {memorial.obituary}
          </div>
          {memorial.obituary.length > 200 && (
            <button
              className="mt-2 text-[0.75rem] text-[#1F2024] flex items-center gap-1 mx-auto hover:text-interactive-primary-default transition-colors"
              onClick={() => {
                // Scroll to full obituary in content area
                const obituarySection = document.getElementById('obituary-section');
                if (obituarySection) {
                  obituarySection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Mehr lesen
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.07494 5.86947L2.90411 5.04297L8.51094 10.6498L14.1134 5.04297L14.9468 5.86947L8.51094 12.3053L2.07494 5.86947Z" fill="currentColor"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MemorialProfileSidebar;
