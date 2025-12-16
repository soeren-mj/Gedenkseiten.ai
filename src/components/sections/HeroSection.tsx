import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export interface HeroSectionProps {
  // Content
  title: string;
  description: string;
  
  // Optional elements
  tag?: {
    text: string;
    color?: 'red' | 'blue' | 'green';
  };
  badge?: {
    text: string;
  };
  
  // Buttons & Actions
  primaryButton?: {
    text: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary' | 'tertiary';
    className?: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
    type?: 'link' | 'button';
  };
  shareButton?: {
    text: string;
    onClick?: () => void;
  };
  
  // Avatar group (for social proof)
  avatarGroup?: {
    images: Array<{ src: string; alt: string }>;
    text: string;
  };
  
  // Background image
  backgroundImage?: {
    src: string;
    alt?: string;
    className?: string;
    blendMode?: 'screen' | 'lighten' | 'multiply' | 'overlay' | 'soft-light';
  };
  
  // Custom className
  className?: string;
}

export function HeroSection({
  title,
  description,
  tag,
  badge,
  primaryButton,
  secondaryAction,
  shareButton,
  avatarGroup,
  backgroundImage,
  className,
}: HeroSectionProps) {
  // Determine tag color class
  const tagColorClass = tag?.color === 'red' 
    ? 'text-accent-red' 
    : tag?.color === 'blue'
    ? 'text-accent-blue'
    : tag?.color === 'green'
    ? 'text-accent-green'
    : 'text-accent-red'; // default

  return (
    <section
      className={`w-full relative flex flex-col justify-center pb-16 pt-16 md:pt-32 ${className || ''}`}
    >
      {/* Content Container */}
      <div className="w-full px-[1.25rem] md:px-[3.75rem] lg:px-[3.75rem]">
        <div className="w-full max-w-[113.75rem] mx-auto">
          {/* Badge (optional, shown above content) */}
          {badge && (
            <div className="mb-6 text-center md:text-left">
              <span className="inline-block rounded-full bg-bw-opacity-60 px-4 py-1 text-body-s-semibold text-secondary">
                {badge.text}
              </span>
            </div>
          )}
          
          <div className="w-full justify-between items-start px-2 md:px-[2rem]">
            <div className="w-full lg:max-w-[42.8125rem] flex flex-col gap-2 items-start">
              {tag && (
                <div className={`text-tag ${tagColorClass}`}>
                  {tag.text}
                </div>
              )}
              <div>
                <h1>{title}</h1>
              </div>
              <div className="text-body-l text-secondary max-w-full lg:max-w-[42.8125rem]">
                {description}
              </div>
            </div>
            
            {avatarGroup && (
              <div className="flex items-center mt-6 py-8 space-x-3">
                <div className="flex -space-x-4">
                  {avatarGroup.images.map((img, index) => (
                    <div key={index} className="relative w-10 h-10 rounded-full border-1 border-white overflow-hidden">
                      <Image 
                        src={img.src} 
                        alt={img.alt} 
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-body-m text-secondary">{avatarGroup.text}</p>
              </div>
            )}

            {/* Primary Button and Secondary Action */}
            {(primaryButton || secondaryAction) && (
              <div className="flex items-end py-6 self-stretch gap-4 flex-col sm:flex-row">
                {primaryButton && (
                  primaryButton.href ? (
                    <Link href={primaryButton.href}>
                      <Button 
                        variant={primaryButton.variant || 'primary'}
                        size="md"
                        className={primaryButton.className}
                      >
                        {primaryButton.text}
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant={primaryButton.variant || 'primary'}
                      size="md"
                      onClick={primaryButton.onClick}
                      className={primaryButton.className}
                    >
                      {primaryButton.text}
                    </Button>
                  )
                )}
                {secondaryAction && (
                  secondaryAction.type === 'button' ? (
                    <Button variant="text" size="md">
                      {secondaryAction.text}
                    </Button>
                  ) : (
                    <Link href={secondaryAction.href} className="text-link-default hover:underline self-center sm:self-end">
                      {secondaryAction.text}
                    </Link>
                  )
                )}
              </div>
            )}

            {/* Share Button (optional, shown on the right) */}
            {shareButton && (
              <div className="flex items-start justify-end mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={shareButton.onClick}
                  className="border border-interactive-info !bg-interactive-info !text-interactive-info"
                >
                  {shareButton.text}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Background Image */}
      {backgroundImage && (
        <Image
          width={900}
          height={540}
          src={backgroundImage.src}
          alt={backgroundImage.alt || 'Hero Background'}
          className={`pointer-events-none select-none absolute right-[-2vw] bottom-[-32vw] md:bottom-[-10vw] w-[90vw] max-w-[1200px] md:w-[60vw] md:max-w-[900px] h-auto object-contain z-0 ${backgroundImage.blendMode ? `mix-blend-${backgroundImage.blendMode}` : ''} ${backgroundImage.className || ''}`}
          aria-hidden="true"
        />
      )}
    </section>
  );
}

// Export default for backward compatibility
export default HeroSection;
