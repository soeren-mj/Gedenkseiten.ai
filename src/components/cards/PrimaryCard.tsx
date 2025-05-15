import React from 'react';
import EncryptedIcon from '@/components/icons/EncryptedIcon';
import SupportIcon from '@/components/icons/SupportIcon';
import ConnectIcon from '@/components/icons/ConnectIcon';
import CondolenceIcon from '@/components/icons/CondolenceIcon';
import MediaIcon from '@/components/icons/MediaIcon';
import ModernIcon from '@/components/icons/ModernIcon';
import Image from 'next/image';

interface PrimaryCardProps {
  icon: string;
  headline: string;
  description: string;
  image: string;
  imageAlt?: string;
}

const PrimaryCard: React.FC<PrimaryCardProps> = ({
  icon,
  headline,
  description,
  image,
  imageAlt = headline
}) => {
  const renderIcon = () => {
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
    <div className="min-w-[20rem] max-w-[22.875rem] w-auto h-[25.8125rem] p-[1.25rem_0.5rem_0_0.5rem] rounded-[1.5rem] border border-[var(--border-card,#000)] bg-[var(--background-opacity-primary,rgba(0,0,0,0.6))] shadow-[1px_1px_10px_1px_rgba(210,211,217,0.20)] backdrop-blur-[30.5px] flex flex-col justify-between items-start overflow-hidden transition-colors transition-shadow duration-200 hover:bg-black hover:shadow-[0_4px_24px_0_rgba(210,211,217,0.28)]">
      <>
        <div className="flex items-start gap-6 px-2 w-full">
          {/* Icon links oben */}
          <div className="text-[var(--foreground-interactiv-accents-orange,#E5A417)] mt-[0.125rem] flex-shrink-0">
            {renderIcon()}
          </div>
          {/* Text-Container */}
          <div className="flex flex-col items-start gap-2 flex-1">
            <div className="text-[var(--foreground-primary,#F0F0F2)] font-inter text-base font-semibold leading-normal">{headline}</div>
            <div className="text-[var(--foreground-secondary,#C0C1CC)] font-inter text-sm font-medium leading-[1.65] tracking-[0.01531rem] mt-1">{description}</div>
          </div>
        </div>
        <div className="relative w-full h-[10.86256rem] mt-4">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover rounded-tl-[16px] rounded-tr-[16px]"
          />
        </div>
      </>
    </div>
  );
};

export default PrimaryCard; 