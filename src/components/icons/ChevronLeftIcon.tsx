import React from 'react';

interface ChevronLeftIconProps {
  size?: number;
  className?: string;
}

export default function ChevronLeftIcon({ size = 16, className = '' }: ChevronLeftIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M23.3502 29.4229L13.9102 19.9829L23.3502 10.5321L24.8414 12.0234L16.8927 19.9829L24.8414 27.9317L23.3502 29.4229Z"
        fill="currentColor"
      />
    </svg>
  );
}
