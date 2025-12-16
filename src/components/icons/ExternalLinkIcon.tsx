import React from 'react';

interface IconProps {
  className?: string;
}

export default function ExternalLinkIcon({ className = '' }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="externalLinkMask"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#externalLinkMask)">
        <path
          d="M5.06425 20.5C4.63442 20.5 4.26625 20.3468 3.95975 20.0403C3.65325 19.7338 3.5 19.3656 3.5 18.9358V5.06425C3.5 4.63442 3.65325 4.26625 3.95975 3.95975C4.26625 3.65325 4.63442 3.5 5.06425 3.5H11.3615V4.7565H5.06425C4.98725 4.7565 4.91667 4.7885 4.8525 4.8525C4.7885 4.91667 4.7565 4.98725 4.7565 5.06425V18.9358C4.7565 19.0128 4.7885 19.0833 4.8525 19.1475C4.91667 19.2115 4.98725 19.2435 5.06425 19.2435H18.9358C19.0128 19.2435 19.0833 19.2115 19.1475 19.1475C19.2115 19.0833 19.2435 19.0128 19.2435 18.9358V12.6385H20.5V18.9358C20.5 19.3656 20.3468 19.7338 20.0403 20.0403C19.7338 20.3468 19.3656 20.5 18.9358 20.5H5.06425ZM9.64475 15.25L8.76025 14.3553L18.359 4.7565H13.5025V3.5H20.5V10.4975H19.2435V5.65125L9.64475 15.25Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
