import React from 'react';

interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'sm' | 'lg';
  className?: string;
}

export const SearchIcon: React.FC<SearchIconProps> = ({ 
  variant = 'sm', 
  className,
  ...props 
}) => {
  if (variant === 'sm') {
    return (
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 17.5L13.875 13.875"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
        id="mask0_6147_66038" 
        style={{ maskType: 'alpha' }} 
        maskUnits="userSpaceOnUse" 
        x="0" 
        y="0" 
        width="40" 
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#mask0_6147_66038)">
        <path 
          d="M32.8179 34.278L22.1191 23.5793C21.2885 24.2976 20.3247 24.854 19.2274 25.2484C18.1299 25.6426 16.9941 25.8397 15.8199 25.8397C12.9838 25.8397 10.5835 24.858 8.6191 22.8947C6.65493 20.9314 5.67285 18.5447 5.67285 15.7347C5.67285 12.9244 6.65452 10.5368 8.61785 8.57177C10.5812 6.60677 12.9699 5.62427 15.7841 5.62427C18.5983 5.62427 20.9876 6.60607 22.952 8.56968C24.9167 10.5336 25.8991 12.9211 25.8991 15.7322C25.8991 16.9072 25.6992 18.0439 25.2995 19.1422C24.9001 20.2405 24.3372 21.2223 23.6108 22.0876L34.3262 32.7584L32.8179 34.278ZM15.8029 23.7459C18.0365 23.7459 19.9285 22.9687 21.4791 21.4143C23.0297 19.8595 23.8049 17.9654 23.8049 15.7318C23.8049 13.4982 23.0297 11.6041 21.4791 10.0497C19.9285 8.49524 18.0365 7.71802 15.8029 7.71802C13.5598 7.71802 11.6597 8.49524 10.1024 10.0497C8.54521 11.6041 7.7666 13.4982 7.7666 15.7318C7.7666 17.9654 8.54521 19.8595 10.1024 21.4143C11.6597 22.9687 13.5598 23.7459 15.8029 23.7459Z" 
          fill="currentColor"
        />
      </g>
    </svg>
  );
};
