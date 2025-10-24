import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';


// Import your icon components here
import EncryptedIcon from '@/components/icons/EncryptedIcon';
import SupportIcon from '@/components/icons/SupportIcon';
import ConnectIcon from '@/components/icons/ConnectIcon';
import CondolenceIcon from '@/components/icons/CondolenceIcon';
import MediaIcon from '@/components/icons/MediaIcon';
import ModernIcon from '@/components/icons/ModernIcon';
import ChatIcon from '@/components/icons/ChatIcon';
import BildverbesserungIcon from '@/components/icons/BildverbesserungIcon';
import AiCircleIcon from '@/components/icons/AiCircleIcon';
import InitialsIcon from '@/components/icons/InitialsIcon';

// Icon components mapping
const iconComponents = {
  encrypted: EncryptedIcon,
  support: SupportIcon,
  connect: ConnectIcon,
  condolence: CondolenceIcon,
  media: MediaIcon,
  modern: ModernIcon,
  chat: ChatIcon,
  bildverbesserung: BildverbesserungIcon,
  aiCircle: AiCircleIcon,
  initials: InitialsIcon,
} as const;

interface PrimaryCardProps {
  icon: keyof typeof iconComponents | React.ReactNode;
  headline: string;
  description: string;
  image: string;
  imageAlt?: string;
  variant?: 'small' | 'large';
  cardHeight?: string; // Keep for backward compatibility
  className?: string;
}

const PrimaryCard: React.FC<PrimaryCardProps> = ({
  icon,
  headline,
  description,
  image,
  imageAlt = headline,
  variant = 'small',
  className
}) => {
  // Render icon with consistent styling
  const renderIcon = () => {
    // If it's already a React element (like from AIUnterstuetzungSection)
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    // If it's a string key from our icon components
    if (typeof icon === 'string' && icon in iconComponents) {
      const IconComponent = iconComponents[icon as keyof typeof iconComponents];
      return <IconComponent className="w-8 h-8" />;
    }
    
    return null;
  };

  return (
    <div 
      className={cn(
        // Base layout - responsive width
        "flex flex-col",
        "w-full", // Full width of grid cell
        "min-h-[25rem]", // Minimum height to maintain consistency
        
        // For large variant, it will span 2 columns in the grid
        variant === 'large' && "md:col-span-2",
        
        // Padding - adjusted for proper spacing
        "p-2 pb-0",
        
        // Background and borders - using design tokens
        "rounded-md border", // Figma shows 20px radius
        "bg-white/60 dark:bg-black/60", // Light/dark backgrounds with opacity
        "border-white dark:border-neutral-800",
        
        // Effects
        "backdrop-blur-[20px]",
        "shadow-[0px_0px_6px_4px_rgba(0,0,0,0.10)]",
        "transition-all duration-200",
        
        // Hover state
        "hover:bg-white dark:hover:bg-black",
        "hover:shadow-[0_4px_24px_0_rgba(210,211,217,0.28)]",
        
        // Overflow hidden for image
        "overflow-hidden",
        
        className
      )}
    >
      {/* Content section with flex-grow to push image to bottom */}
      <div className="flex flex-col gap-4 flex-1 p-2">
        {/* Icon */}
        <div>
          {renderIcon()}
        </div>
        
        {/* Text content */}
       <div className="flex flex-col gap-2">
          {/* Headline - h3 tag with h5 styling */}
          <h3 className="text-title-group-h5 text-foreground-primary">
            {headline}
         </h3>
           {/* Description */}
         <p className={cn(
            "text-body-s",
            "text-foreground-secondary",
            variant === 'large' && "md:max-w-[600px]"
            )}>
           {description}
         </p>
       </div>
      </div>
      
      {/* Image section - responsive height */}
      <div className="relative w-full h-44 flex-shrink-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover rounded-t-sm"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      </div>
    </div>
  );
};

export default PrimaryCard;