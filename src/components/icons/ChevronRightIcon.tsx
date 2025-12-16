import React from 'react';

interface ChevronRightIconProps {
  size?: number;
  className?: string;
}

export default function ChevronRightIcon({ size = 16, className = '' }: ChevronRightIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.20589 14.4187L4.37939 13.5895L9.98623 7.98271L4.37939 2.38021L5.20589 1.54688L11.6417 7.98271L5.20589 14.4187Z"
        fill="currentColor"
      />
    </svg>
  );
}
