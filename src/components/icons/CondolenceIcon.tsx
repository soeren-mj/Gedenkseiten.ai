import React from 'react';

interface IconProps {
  className?: string;
}

export default function CondolenceIcon({ className = '' }: IconProps) {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`[&>g>path]:[fill:url(#gradient)] ${className}`}
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#91377B" />
          <stop offset="100%" stopColor="#17E563" />
        </linearGradient>
      </defs>
      <mask id="mask0_5451_99364" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40">
        <rect width="40" height="40" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#mask0_5451_99364)">
        <path d="M10.416 22.9338H22.7748V20.8397H10.416V22.9338ZM10.416 17.7309H29.5827V15.6367H10.416V17.7309ZM10.416 12.528H29.5827V10.4338H10.416V12.528ZM4.16602 35.0642V6.77383C4.16602 6.05744 4.42143 5.44383 4.93227 4.933C5.4431 4.42217 6.05671 4.16675 6.7731 4.16675H33.2256C33.942 4.16675 34.5556 4.42217 35.0664 4.933C35.5773 5.44383 35.8327 6.05744 35.8327 6.77383V26.5597C35.8327 27.2761 35.5773 27.8897 35.0664 28.4005C34.5556 28.9113 33.942 29.1667 33.2256 29.1667H10.0635L4.16602 35.0642ZM9.15768 27.0726H33.2256C33.3539 27.0726 33.4716 27.0192 33.5785 26.9126C33.6852 26.8056 33.7385 26.688 33.7385 26.5597V6.77383C33.7385 6.6455 33.6852 6.52786 33.5785 6.42091C33.4716 6.31425 33.3539 6.26092 33.2256 6.26092H6.7731C6.64477 6.26092 6.52713 6.31425 6.42018 6.42091C6.31352 6.52786 6.26018 6.6455 6.26018 6.77383V30.0855L9.15768 27.0726Z" fill="url(#gradient)"/>
      </g>
    </svg>
  );
} 