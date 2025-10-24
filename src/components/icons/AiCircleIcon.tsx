import React from 'react';

interface IconProps {
  className?: string;
}

export default function AiCircleIcon({ className = '' }: IconProps) {
  return (
    <svg 
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
     <defs>
     <linearGradient id="warmSunsetGradientAiCircle" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
        <stop offset="10.45%" stopColor="#996DE3" />
        <stop offset="46.56%" stopColor="#E74DC3" />
        <stop offset="83.37%" stopColor="#EDDB16" />
      </linearGradient>
    </defs>
    <path d="M29.3332 15.9993C29.3332 23.3631 23.3636 29.3327 15.9998 29.3327C8.63604 29.3327 2.6665 23.3631 2.6665 15.9993C2.6665 8.63555 8.63604 2.66602 15.9998 2.66602"
    stroke="url(#warmSunsetGradientAiCircle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.3335 8.66602C21.5119 8.66602 23.3335 6.90806 23.3335 2.66602C23.3335 6.90806 25.1424 8.66602 29.3335 8.66602C25.1424 8.66602 23.3335 10.4749 23.3335 14.666C23.3335 10.4749 21.5119 8.66602 17.3335 8.66602Z"
    stroke="url(#warmSunsetGradientAiCircle)" strokeWidth="1.5" strokeLinejoin="round" />
 
  </svg>
  );
}