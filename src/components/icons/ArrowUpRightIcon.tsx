import React from 'react';

interface IconProps {
  className?: string;
  color?: string;
}

export default function ArrowUpRightIcon({ className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask0_arrow_up_right"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_arrow_up_right)">
        <path
          d="M10.3613 29.7827L8.40292 27.8243L24.9788 11.191H9.89417V8.37476H29.7829V28.2635H26.9671V13.2068L10.3613 29.7827Z"
          fill={color}
        />
      </g>
    </svg>
  );
}
