import React from 'react';

interface SmallCardProps {
  number: string;
  headline: string;
  description: string;
  variant?: 'dark' | 'light';
  isLast?: boolean;
}

const SmallCard: React.FC<SmallCardProps> = ({
  number,
  headline,
  description,
  variant = 'dark',
  isLast = false
}) => {
  return (
    <div
      className={`
        h-[384px] w-full
        p-[32px_20px_32px_20px]
        rounded-[24px]
        border border-[#000]
        flex flex-col gap-2
        transition-all duration-200
        ${isLast 
          ? 'bg-white hover:bg-white'
          : variant === 'dark'
            ? 'bg-[var(--background-opacity-primary,rgba(0,0,0,0.86))] hover:bg-[var(--background-bw)]' 
            : 'bg-white hover:bg-white'
        }
        shadow-[1px_1px_10px_1px_rgba(210,211,217,0.20)]
        hover:shadow-[0_4px_24px_0_rgba(210,211,217,0.28)]
      `}
    >
      <div className="flex flex-col gap-2">
        <span className={`font-satoshi font-medium text-[36px] ${variant === 'dark' ? 'text-primary' : 'text-[#000000]'}`}>
          {number}
        </span>
        <h3 className={`font-inter font-medium text-[18px] leading-[150%] ${variant === 'dark' ? 'text-primary' : 'text-[#000000]'}`}>
          {headline}
        </h3>
        <p className={`font-inter font-medium text-[16px] leading-[150%] tracking-[0.5%] ${variant === 'dark' ? 'text-secondary' : 'text-[#636573]'}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default SmallCard; 