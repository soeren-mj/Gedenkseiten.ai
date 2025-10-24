import React, { ReactNode } from 'react';
import EncryptedIcon from '@/components/icons/EncryptedIcon';
import SupportIcon from '@/components/icons/SupportIcon';
import ConnectIcon from '@/components/icons/ConnectIcon';
import CondolenceIcon from '@/components/icons/CondolenceIcon';
import MediaIcon from '@/components/icons/MediaIcon';
import ModernIcon from '@/components/icons/ModernIcon';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PrimaryCardProps {
  icon: string | ReactNode;
  headline: string;
  description: string;
  image: string;
  imageAlt?: string;
  cardHeight?: string;
  variant?: 'default' | 'large';
}

const PrimaryCard: React.FC<PrimaryCardProps> = ({
  icon,
  headline,
  description,
  image,
  imageAlt = headline,
  variant = 'default',
  cardHeight = '30.5rem'
}) => {
  const renderIcon = () => {
    if (typeof icon !== 'string') {
      return icon;
    }
    if (icon === 'encrypted') {
      return <EncryptedIcon className="w-8 h-8 text-[#E5A417]" />;
    }
    if (icon === 'support') {
      return <SupportIcon className="w-8 h-8 text-[#E5A417]" />;
    }
    if (icon === 'connect') {
      return <ConnectIcon className="w-8 h-8 text-[#E5A417]" />;
    }
    if (icon === 'condolence') {
      return <CondolenceIcon className="w-8 h-8 text-[#E5A417]" />;
    }
    if (icon === 'media') {
      return <MediaIcon className="w-8 h-8 text-[#E5A417]" />;
    }
    if (icon === 'modern') {
      return <ModernIcon className="w-8 h-8 text-[#E5A417]" />;
    }
    return (
      <span className="material-symbols-outlined text-[2rem] text-[#E5A417]">
        {icon || 'favorite'}
      </span>
    );
  };

  return (
    <div className={cn(
      "box-border rounded-[1.5rem] border border-[var(--border-card,#000)] bg-[var(--background-opacity-primary,rgba(0,0,0,0.6))] shadow-[1px_1px_10px_1px_rgba(210,211,217,0.20)] backdrop-blur-[30.5px] flex flex-col justify-between items-start overflow-hidden transition-colors transition-shadow duration-200 hover:bg-black hover:shadow-[0_4px_24px_0_rgba(210,211,217,0.28)]",
      variant === 'default' && `min-w-[20rem] max-w-[26rem] w-auto h-[${cardHeight}] p-[1.25rem_0.5rem_0_0.5rem]`,
      variant === 'large' && `w-full h-[${cardHeight}] p-[1.5rem_0.5rem_0_0.5rem]`
    )}>
      <>
        <div className={cn(
          "flex flex-col items-start gap-4 w-full",
          variant === 'default' && "px-2",
          variant === 'large' && "px-4"
        )}>
          {/* Icon links oben */}
          <div className="text-[var(--foreground-interactiv-accents-orange,#E5A417)] mt-[0.125rem] flex-shrink-0">
            {renderIcon()}
          </div>
          {/* Text-Container */}
          <div className="flex flex-col items-start gap-2 flex-1">
            <h5 className={cn(
              "h5 text-[var(--foreground-primary,#F0F0F2)]",
              variant === 'default' && "text-base",
              variant === 'large' && "text-lg"
            )}>{headline}</h5>
            <div className={cn(
              "text-[var(--foreground-secondary,#C0C1CC)] font-inter leading-[1.65] tracking-[0.01531rem] my-1",
              variant === 'default' && "text-md",
              variant === 'large' && "text-md max-w-xl"
            )}>{description}</div>
          </div>
        </div>
        <div className={cn(
          "relative w-full mt-4",
          variant === 'default' && "h-[10.86256rem]",
          variant === 'large' && "h-[14rem]"
        )}>
          <Image
            src={image}
            alt={imageAlt}
            fill
            className={cn(
              "object-cover",
              variant === 'default' && "rounded-tl-[16px] rounded-tr-[16px]",
              variant === 'large' && "rounded-[16px]"
            )}
          />
        </div>
      </>
    </div>
  );
};

export default PrimaryCard; 