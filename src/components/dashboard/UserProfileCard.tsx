'use client'

import Link from 'next/link'
import Image from 'next/image'
import { InitialsPreview } from '@/components/memorial/InitialsPreview'
import PersonIcon from '@/components/icons/PersonIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import { Badge } from '@/components/ui/Badge'

interface UserProfileCardProps {
  name?: string | null
  email?: string
  avatarUrl?: string | null
  accountType?: 'free' | 'premium'
  className?: string
}

export default function UserProfileCard({
  name,
  email,
  avatarUrl,
  accountType = 'free',
  className = '',
}: UserProfileCardProps) {
  const displayName = name || email || 'Benutzer'
  const isPremium = accountType === 'premium'

  // Determine avatar type
  const hasImage = !!avatarUrl
  const hasName = !!name

  return (
    <div className={`relative overflow-visible ${className}`}>
      {/* Background Blur */}
      <div className="absolute -top-32 -left-32 -right-32 -bottom-32 pointer-events-none">
        <Image
          src="/images/profil-blur.webp"
          alt=""
          width={400}
          height={500}
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>

      {/* Card */}
      <div className="p-2 bg-bw border border-main rounded-lg flex max-w-xs min-w-[320px] flex-col relative z-10">
        {/* Avatar Area */}
      <div className="w-full h-72 flex items-center justify-center mb-6">
        {hasImage ? (
          <div className="w-full h-72 relative rounded-md overflow-hidden">
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : hasName ? (
          <div className="w-full h-72 flex items-center justify-center bg-accent rounded-md">
            <InitialsPreview
              firstName={name.split(' ')[0] || ''}
              lastName={name.split(' ').slice(1).join(' ') || ''}
              size={100}
              showBackground={false}
            />
          </div>
        ) : (
          <div className="w-full h-72 flex items-center justify-center bg-accent rounded-md text-white">
            <PersonIcon className="w-16 h-16" color="white" />
          </div>
        )}
      </div>

      {/* Name and Account Information */}
      <div className="flex flex-col gap-2 px-2 mb-10">
      {/* Name */}
      <h2 className="font-satoshi font-medium text-[2rem] leading-[120%] tracking-[-0.015em] text-primary line-clamp-2">
        {displayName}
      </h2>

      {/* Account Badge */}
      <div className="">
        {isPremium ? (
          <Badge variant="premium">Premium</Badge>
        ) : (
          <Badge variant="soon">Kostenfreier Account</Badge>
        )}
      </div>
      </div>

        {/* Settings Link */}
        <div className="mt-auto px-2 pb-2">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-1 text-body-s text-primary hover:text-primary transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Einstellungen</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
