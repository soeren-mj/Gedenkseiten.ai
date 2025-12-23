import React from 'react';

interface TextColorIconProps {
  size?: number;
  className?: string;
}

/**
 * TextColorIcon - "A" icon with underline for text color toggle
 */
export default function TextColorIcon({ size = 40, className = '' }: TextColorIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask0_textcolor"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_textcolor)">
        <path
          d="M4.16602 39.9999V33.782H35.8327V39.9999H4.16602ZM9.77518 28.3333L18.7602 5.83325H21.2385L30.2235 28.3333H27.6406L25.2556 22.1774H14.6852L12.2943 28.3333H9.77518ZM15.4844 20.0362H24.4502L20.0827 8.74117H19.8839L15.4844 20.0362Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
