import React from 'react';

interface PauseIconProps {
  size?: number;
  className?: string;
}

export default function PauseIcon({ size = 16, className = '' }: PauseIconProps) {
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
        d="M23.2372 30.8333V9.16663H29.7864V30.8333H23.2372ZM10.2139 30.8333V9.16663H16.7735V30.8333H10.2139Z"
        fill="currentColor"
      />
    </svg>
  );
}
