import React from 'react';

interface XIconProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'sm' | 'lg';
  className?: string;
}

export const XIcon: React.FC<XIconProps> = ({ 
  variant = 'sm', 
  className,
  ...props 
}) => {
  if (variant === 'sm') {
    return (
      <svg 
        width="24" 
        height="25" 
        viewBox="0 0 24 25" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <mask 
          id="mask0_3591_23827" 
          style={{ maskType: 'alpha' }} 
          maskUnits="userSpaceOnUse" 
          x="0" 
          y="0" 
          width="24" 
          height="25"
        >
          <rect y="0.5" width="24" height="24" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_3591_23827)">
          <path 
            d="M7.78732 17.607L6.89307 16.7127L11.1058 12.5L6.89307 8.31222L7.78732 7.41797L12.0001 11.6307L16.1878 7.41797L17.0821 8.31222L12.8693 12.5L17.0821 16.7127L16.1878 17.607L12.0001 13.3942L7.78732 17.607Z" 
            fill="currentColor"
          />
        </g>
      </svg>
    );
  }

  // variant === 'lg'
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <mask 
        id="mask0_2201_11303" 
        style={{ maskType: 'alpha' }} 
        maskUnits="userSpaceOnUse" 
        x="0" 
        y="0" 
        width="40" 
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#mask0_2201_11303)">
        <path 
          d="M10.5254 30.9488L9.05078 29.4742L18.5254 20L9.05078 10.5259L10.5254 9.05127L19.9995 18.5259L29.4737 9.05127L30.9483 10.5259L21.4737 20L30.9483 29.4742L29.4737 30.9488L19.9995 21.4742L10.5254 30.9488Z" 
          fill="currentColor"
        />
      </g>
    </svg>
  );
};
