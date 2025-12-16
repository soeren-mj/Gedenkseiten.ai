'use client'

import React, { useState, useRef } from 'react'
import { Tooltip } from './Tooltip'
import Image from 'next/image'

interface InitialsAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  imageUrl?: string | null
  avatarType?: 'initials' | 'image'
  editable?: boolean
  onUpload?: (file: File) => void
  onDelete?: () => void
  isUploading?: boolean
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  size = 'md',
  className = '',
  imageUrl = null,
  // avatarType is kept in props for backward compatibility but display is based on imageUrl presence
  editable = false,
  onUpload,
  onDelete,
  isUploading = false
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleteHovered, setIsDeleteHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6 sm:w-8 sm:h-8 text-webapp-group sm:text-webapp-group',
    md: 'w-6 h-6 sm:w-10 sm:h-10 text-webapp-group sm:text-webapp-group',
    lg: 'w-8 h-8 sm:w-12 sm:h-12 text-webapp-subsection sm:text-webapp-subsection',
    xl: 'w-10 h-10 sm:w-16 sm:h-16 text-webapp-section sm:text-webapp-section'
  }

  // Delete button size based on avatar size
  const deleteButtonSize = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const handleClick = () => {
    if (editable && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onUpload) {
      onUpload(file)
      // Reset input so the same file can be selected again
      event.target.value = ''
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && !isUploading) {
      onDelete()
    }
  }

  // Dynamic tooltip text based on whether hovering over delete button or avatar
  const tooltipText = imageUrl
    ? (isDeleteHovered ? 'Foto löschen' : 'Foto ändern')
    : 'Foto wählen'

  return (
    <div className="relative inline-block">
      <div
        className={`
          ${sizeClasses[size]}
          relative
          shrink-0
          ${editable ? 'cursor-pointer' : ''}
          ${className}
        `}
        onMouseEnter={() => editable && setIsHovered(true)}
        onMouseLeave={() => editable && setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Inner circle with overflow-hidden for image/initials */}
        <div
          className={`
            w-full
            h-full
            rounded-full
            relative
            ${imageUrl ? 'bg-transparent' : 'bg-[#92A1FC]'}
            text-white
            flex
            items-center
            justify-center
            font-medium
            overflow-hidden
            ${isUploading ? 'opacity-50' : ''}
          `}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              unoptimized // For Supabase storage URLs
            />
          ) : (
            getInitials(name)
          )}

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-bw bg-opacity-50 flex items-center justify-center rounded-full">
              <svg
                className="animate-spin h-5 w-5 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {/* Delete button - positioned on outer container, outside the overflow-hidden circle */}
        {editable && isHovered && imageUrl && !isUploading && (
          <button
            onClick={handleDeleteClick}
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
            className={`
              absolute
              -top-1
              -right-1
              ${deleteButtonSize[size]}
              bg-bw
              rounded-full
              flex
              items-center
              justify-center
              shadow-lg
              hover:bg-secondary
              transition-colors
              z-10
            `}
            aria-label="Foto löschen"
          >
            <svg
              className="w-3/5 h-3/5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Tooltip - only show when editable and hovered */}
      {editable && <Tooltip text={tooltipText} show={isHovered && !isUploading} />}

      {/* Hidden file input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      )}
    </div>
  )
}

export default InitialsAvatar
