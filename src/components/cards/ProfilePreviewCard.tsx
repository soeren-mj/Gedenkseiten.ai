'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Reactions from '../ui/Reactions';
import { InitialsPreview } from '../memorial/InitialsPreview';
import { MEMORIAL_REACTIONS, type Reaction } from '@/constants/reactionIcons';
import { isoDateToGerman } from '@/lib/utils/date-validation';
import PersonIcon from '@/components/icons/PersonIcon';
import AnimalIcon from '@/components/icons/AnimalIcon';

export interface ProfilePreviewCardProps {
  // Core data
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  deathDate?: string;
  type?: 'human' | 'animal';

  // Optional data
  birthPlace?: string;
  deathPlace?: string;
  calloutText?: string;
  obituary?: string;
  animalBreedInfo?: {
    species?: string;
    group?: string;
    breed?: string;
  };

  // Avatar configuration
  avatarType?: 'initials' | 'icon' | 'image';
  avatarUrl?: string;

  // Feature toggles (default: true for full variant, false for compact)
  showReactions?: boolean;
  showObituary?: boolean;
  showBadge?: boolean;
  showCallout?: boolean;
  showBreedInfo?: boolean;

  // Interaction handlers
  onReactionClick?: (reaction: Reaction) => void;

  // Layout & styling
  variant?: 'full' | 'compact';
  className?: string;

  // Reactions state (controlled component)
  reactions?: Reaction[];
}

/**
 * Helper: Format date safely (handles both ISO and German format)
 */
function formatDateSafely(date?: string): string {
  if (!date) return '';

  // Check if already in German format (DD.MM.YYYY)
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
    return date;
  }

  // Try to convert from ISO format
  try {
    return isoDateToGerman(date);
  } catch {
    return date; // Fallback to original if conversion fails
  }
}

/**
 * ProfilePreviewCard Component
 *
 * Flexible memorial preview card with two variants:
 * - full: Complete card for public pages (with reactions, obituary, etc.)
 * - compact: Simplified card for wizard sidebar (avatar + name + dates only)
 *
 * @example Full variant (public page)
 * ```tsx
 * <ProfilePreviewCard
 *   firstName="Jaune"
 *   lastName="Pierreen Mont-Dereville"
 *   birthDate="01.08.1946"
 *   deathDate="28.10.2023"
 *   type="human"
 *   variant="full"
 * />
 * ```
 *
 * @example Compact variant (wizard sidebar)
 * ```tsx
 * <ProfilePreviewCard
 *   firstName={firstName}
 *   lastName={lastName}
 *   birthDate={birthDate}
 *   deathDate={deathDate}
 *   avatarType="initials"
 *   variant="compact"
 *   showReactions={false}
 *   showObituary={false}
 *   showBadge={false}
 *   showCallout={false}
 * />
 * ```
 */
const ProfilePreviewCard: React.FC<ProfilePreviewCardProps> = ({
  // Core data with demo defaults
  firstName = 'Jaune Pierreen',
  lastName = 'Mont-Dereville',
  birthDate = '01.08.1946',
  deathDate = '28.10.2023',
  type = 'human',

  // Optional data
  birthPlace = 'Isaoberammergau',
  deathPlace = 'Recklinghausen',
  calloutText,
  obituary,
  animalBreedInfo,

  // Avatar
  avatarType = 'image',
  avatarUrl,

  // Feature toggles
  showReactions = true,
  showObituary = true,
  showBadge = true,
  showCallout = true,
  showBreedInfo = true,

  // Handlers
  onReactionClick,

  // Layout
  variant = 'compact',
  className = '',

  // Reactions
  reactions: controlledReactions,
}) => {
  // Internal reactions state (only used if reactions prop not provided)
  const [internalReactions, setInternalReactions] = useState<Reaction[]>(MEMORIAL_REACTIONS);

  // Use controlled reactions if provided, otherwise use internal state
  const reactions = controlledReactions || internalReactions;

  const handleReactionClick = (idx: number) => {
    if (!showReactions) return;

    const clickedReaction = reactions[idx];

    // Call external handler if provided
    if (onReactionClick) {
      onReactionClick(clickedReaction);
    }

    // Update internal state if not controlled
    if (!controlledReactions) {
      const updated = reactions.map((r, i) =>
        i === idx ? { ...r, value: r.value + 1 } : r
      );
      // Sort by value descending
      updated.sort((a, b) => b.value - a.value);
      setInternalReactions(updated);
    }
  };

  // Default demo data
  const isAnimal = type === 'animal';
  const defaultAvatarUrl = isAnimal
    ? "/images/gedenkseite-tier.png"
    : "/images/profil-gedenkseite-jaune-pieree-mont-dereville.png";

  const defaultCallout = isAnimal
    ? 'Treuer Begleiter, Familienmitglied und bester Freund. Wir werden dich nie vergessen.'
    : 'Liebende Mutter von drei Kindern, den wir immer in unseren Herzen tragen werden.';

  const defaultObituary = "Lorem ipsum dolor sit amet consectetur. Erat malesuada nulla urna ultrices euismod vel volutpat. Sed sed porta nascetur eget ultrices sit ornare mattis. Orci suspendisse morbi lectus id mauris tortor iaculis mauris neque. Vitae diam convallis justo lacus ut vestibulum sapien elit. Adipiscing nascetur feugiat porttitor volutpat rhoncus...";

  // Compact variant rendering
  if (variant === 'compact') {
    return (
      <div className={`p-2 bg-bw border border-main rounded-lg ${className}`}>
        {/* Avatar */}
        <div className="w-full h-72 flex items-center justify-center mb-4">
          {avatarType === 'initials' && (
            <div className="w-full h-72 flex items-center justify-center bg-accent rounded-md">
              <InitialsPreview
                firstName={firstName}
                lastName={lastName || ''}
                size={100}
                showBackground={false}
              />
            </div>
          )}
          {avatarType === 'icon' && (
            <div className="w-full h-72 flex items-center justify-center bg-accent rounded-md text-white">
              {isAnimal ? (
                <AnimalIcon className="w-16 h-16" color="white" />
              ) : (
                <PersonIcon className="w-16 h-16" color="white" />
              )}
            </div>
          )}
          {avatarType === 'image' && (
            <div className="w-full h-72 relative rounded-md overflow-hidden">
              <Image
                src={avatarUrl || defaultAvatarUrl}
                alt={`${firstName} ${lastName}`}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Name */}
        <h1 className="text-[2rem] leading-[120%] tracking-[-0.015em] mb-2 px-2">
          {firstName} {isAnimal ? '' : lastName}
        </h1>

        {/* Dates */}
        <div className="space-y-1 text-body-m text-secondary px-2 mb-6">
          <div className="flex items-start gap-1">
            <span className="text-secondary text-center w-2.5">*</span>
            <div className="flex-1">
              <span>{formatDateSafely(birthDate)}</span>
              {birthPlace && <span className="text-secondary ml-2">{birthPlace}</span>}
            </div>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-secondary text-center w-2.5">✝</span>
            <div className="flex-1">
              <span>{formatDateSafely(deathDate)}</span>
              {deathPlace && <span className="text-secondary ml-2">{deathPlace}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full variant rendering (default)
  return (
    <div className={`w-[427px] max-w-full bg-white rounded-[28px] p-2 sm:p-2 flex flex-col gap-8 shadow border border-main mx-auto ${className}`}>
      {/* Profilbild + Badge */}
      <div className="flex flex-col items-end">
        <div className="w-full aspect-square relative">
          <Image
            src={avatarUrl || defaultAvatarUrl}
            alt={isAnimal ? "Profilbild Tier" : `Profilbild ${firstName} ${lastName}`}
            fill
            className="rounded-[20px] object-cover"
          />
        </div>
        {showBadge && (
          <div className="-mt-6 mr-2 px-3 py-1 bg-gradient-to-r from-[#17E563] to-[#6CDC95] rounded-tl-[6px] rounded-br-[20px] flex items-center gap-2 shadow text-xs">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="6" fill="#D9D9D9" />
              <rect x="1" y="1" width="10" height="10" rx="5" fill="#EBF2EE" />
            </svg>
            <span className="text-[#EBF2EE] font-inter font-semibold uppercase tracking-wider">Verifiziert</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 px-2">
        <div>
          {/* Name and dates container */}
          <div className="flex flex-col gap-2">
            <div className="font-satoshi font-medium text-[2rem] leading-[1.2] tracking-[-0.09375rem] text-black sm:text-[32px] sm:tracking-normal whitespace-pre-line">
              {isAnimal ? firstName : `${firstName}\n${lastName}`}
            </div>

            {/* Animal breed info */}
            {isAnimal && showBreedInfo && animalBreedInfo && (
              <div className="flex gap-2 items-center text-[1rem] font-inter font-semibold text-[#4D4E59]">
                {animalBreedInfo.species && <span>𝌁 {animalBreedInfo.species}</span>}
                {animalBreedInfo.group && <span>𝌄 {animalBreedInfo.group}</span>}
                {animalBreedInfo.breed && <span>𝌀 {animalBreedInfo.breed}</span>}
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-col gap-1 text-[14px] text-[#636573] font-inter">
              <div className="flex gap-2 items-center">
                <span>*</span>
                <span>{birthDate}</span>
                {birthPlace && <span>{birthPlace}</span>}
              </div>
              <div className="flex gap-2 items-center">
                <span>†</span>
                <span>{deathDate}</span>
                {deathPlace && <span>{deathPlace}</span>}
              </div>
            </div>
          </div>

          {/* Callout */}
          {showCallout && (
            <div className="mt-6 font-inter text-[1.25rem] leading-[1.35] tracking-[-0.0075rem] text-[#4D4E59]">
              {calloutText || defaultCallout}
            </div>
          )}
        </div>
      </div>

      {/* Reaktionen */}
      {showReactions && (
        <div className="border-t border-b border-main py-4 px-5 flex flex-col gap-4">
          <div className="text-[14px] font-inter font-semibold text-[#1F2024] mb-2">Reaktionen</div>
          <Reactions
            reactions={reactions}
            onReactionClick={(reaction) => {
              const idx = reactions.findIndex(r => r.key === reaction.key);
              if (idx !== -1) {
                handleReactionClick(idx);
              }
            }}
          />
        </div>
      )}

      {/* Nachruf */}
      {showObituary && (
        <div className="flex flex-col gap-2 px-2 pb-2">
          <div className="text-[1.25rem] text-[#1F2024]">Nachruf</div>
          <div className="text-[1rem] text-[#4D4E59] leading-[1.55]">
            {obituary || defaultObituary}
          </div>
          <button className="mt-2 text-[0.75rem] text-[#1F2024] flex items-center gap-1 mx-auto">
            Mehr lesen
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.07494 5.86947L2.90411 5.04297L8.51094 10.6498L14.1134 5.04297L14.9468 5.86947L8.51094 12.3053L2.07494 5.86947Z" fill="#2F2F30"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePreviewCard;
