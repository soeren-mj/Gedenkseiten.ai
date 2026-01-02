import React from 'react';

interface PlayIconProps {
  size?: number;
  className?: string;
}

export default function PlayIcon({ size = 16, className = '' }: PlayIconProps) {
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
        d="M14.167 30.0984V9.77795L30.1282 19.938L14.167 30.0984Z"
        fill="currentColor"
      />
    </svg>
  );
}
