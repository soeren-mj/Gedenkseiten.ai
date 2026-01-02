import React from 'react';

interface DeleteIconProps {
  size?: number;
  className?: string;
}

/**
 * DeleteIcon - Simple trash can icon
 */
export default function DeleteIcon({ size = 24, className = '' }: DeleteIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask id="mask0_delete" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40">
        <rect width="40" height="40" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_delete)">
        <path
          d="M11.7908 34.1667C11.0767 34.1667 10.4636 33.9107 9.95167 33.3988C9.43972 32.8869 9.18375 32.2738 9.18375 31.5596V9.39088H7.5V7.29713H14.7521V6.02588H25.2479V7.29713H32.5V9.39088H30.8163V31.5596C30.8163 32.276 30.5608 32.8896 30.05 33.4005C29.5392 33.9113 28.9256 34.1667 28.2092 34.1667H11.7908ZM28.7221 9.39088H11.2779V31.5596C11.2779 31.7094 11.3278 31.8323 11.4275 31.9284C11.5272 32.0245 11.6483 32.0725 11.7908 32.0725H28.2092C28.3375 32.0725 28.4551 32.0192 28.5621 31.9125C28.6688 31.8056 28.7221 31.688 28.7221 31.5596V9.39088ZM15.8142 28.6155H17.9079V12.8205H15.8142V28.6155ZM22.0921 28.6155H24.1858V12.8205H22.0921V28.6155Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
