import React from 'react';

interface ReportIconProps {
  className?: string;
  size?: number;
}

/**
 * ReportIcon - Octagon with exclamation mark
 * Used for reporting/melden actions
 */
export default function ReportIcon({
  className = '',
  size = 24,
}: ReportIconProps) {
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
        id="mask0_report"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_report)">
        <path
          d="M20.0007 27.8355C20.3479 27.8355 20.643 27.7139 20.8861 27.4709C21.1291 27.2278 21.2507 26.9345 21.2507 26.5909C21.2507 26.2473 21.1291 25.9539 20.8861 25.7109C20.643 25.4678 20.3479 25.3463 20.0007 25.3463C19.6534 25.3463 19.3601 25.4678 19.1207 25.7109C18.8812 25.9539 18.7615 26.2473 18.7615 26.5909C18.7615 26.9345 18.8812 27.2278 19.1207 27.4709C19.3601 27.7139 19.6534 27.8355 20.0007 27.8355ZM18.9536 22.3505H21.0477V11.8292H18.9536V22.3505ZM14.1032 34.1667L5.83398 25.905V14.1025L14.0957 5.83337H25.8982L34.1673 14.095V25.8975L25.9057 34.1667H14.1032ZM14.9786 32.0725H25.0198L32.0732 25.0221V14.9809L25.0227 7.92754H14.9815L7.92815 14.978V25.0192L14.9786 32.0725Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
