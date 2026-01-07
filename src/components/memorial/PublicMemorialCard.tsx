'use client';

import React from 'react';
import Image from 'next/image';
import { InitialsPreview } from './InitialsPreview';
import { Memorial } from '@/lib/supabase';
import { formatFullName } from '@/lib/utils/nameFormatter';

export interface PublicMemorialCardProps {
  memorial: Memorial;
  className?: string;
}

/**
 * PublicMemorialCard Component
 *
 * Profile card for public memorial pages
 * Displays memorial profile information: photo, name, dates, and callout
 */
export const PublicMemorialCard = ({
  memorial,
  className = '',
}: PublicMemorialCardProps) => {
  const isAnimal = memorial.type === 'pet';

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
    <div className={className}>
      {/* Main Card */}
      <div className="w-full lg:w-[427px] p-2 pb-6 bg-bw border-r border-b border-main rounded-lg flex flex-col gap-8">
        {/* Avatar + Badge */}
        <div className="flex flex-col items-end">
          <div className="w-full aspect-square relative">
            {memorial.avatar_type === 'initials' ? (
              <div className="w-full h-full flex items-center justify-center bg-accent rounded-md">
                <InitialsPreview
                  firstName={memorial.first_name || ''}
                  lastName={memorial.last_name || ''}
                  size={100}
                  showBackground={false}
                />
              </div>
            ) : (
              <div className="w-full h-full relative rounded-md overflow-hidden">
                <Image
                  src={avatarUrl}
                  alt={isAnimal ? `Profilbild ${memorial.first_name}` : `Profilbild ${memorial.first_name} ${memorial.last_name}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-2">
          {/* Name and dates */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {/* Name */}
              <h1 className="text-primary whitespace-pre-line">
                {fullName}
              </h1>

              {/* Animal breed info */}
              {isAnimal && (memorial.Tierarten || memorial.Rassengruppe || memorial.Rassen) && (
                <div className="flex gap-4 text-body-m text-secondary">
                  {memorial.Tierarten?.Tierart_Name && (
                    <div className="flex gap-2 items-center">
                      <span>𝌂</span>
                      <span>{memorial.Tierarten.Tierart_Name}</span>
                    </div>
                  )}
             
                  {memorial.Rassen?.Rasse_Name && (
                    <div className="flex gap-2 items-center">
                      <span>𝌀</span>
                      <span>{memorial.Rassen.Rasse_Name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Birth/Death dates */}
              <div className="flex flex-col gap-1 text-body-m text-secondary">
                {birthDate && (
                  <div className="flex gap-2 items-center">
                    <span>*</span>
                    <span className="w-[100px]">{birthDate}</span>
                    {memorial.birth_place && <span>{memorial.birth_place}</span>}
                  </div>
                )}
                {deathDate && (
                  <div className="flex gap-2 items-center">
                    <span>†</span>
                    <span className="w-[100px]">{deathDate}</span>
                    {memorial.death_place && <span>{memorial.death_place}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Gedenkspruch (Quote) */}
            {memorial.memorial_quote && (
              <h3 className="text-primary">
                {memorial.memorial_quote}
              </h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMemorialCard;
