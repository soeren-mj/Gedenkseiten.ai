import React from 'react';

interface ImageIconProps {
  size?: number;
  className?: string;
}

/**
 * ImageIcon - Icon for preset image selection
 * Shows a picture frame with landscape/mountains inside
 */
export default function ImageIcon({ size = 16, className = '' }: ImageIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask0_image_icon"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="32"
        height="32"
      >
        <rect width="32" height="32" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_image_icon)">
        <path
          d="M6.75217 27.3333C6.17906 27.3333 5.68817 27.129 5.2795 26.7203C4.87084 26.3116 4.6665 25.8207 4.6665 25.2476V6.75229C4.6665 6.17918 4.87084 5.68829 5.2795 5.27963C5.68817 4.87096 6.17906 4.66663 6.75217 4.66663H25.2475C25.8206 4.66663 26.3115 4.87096 26.7202 5.27963C27.1288 5.68829 27.3332 6.17918 27.3332 6.75229V25.2476C27.3332 25.8207 27.1288 26.3116 26.7202 26.7203C26.3115 27.129 25.8206 27.3333 25.2475 27.3333H6.75217ZM6.75217 25.658H25.2475C25.3502 25.658 25.4443 25.6153 25.5298 25.53C25.6152 25.4444 25.6578 25.3503 25.6578 25.2476V6.75229C25.6578 6.64963 25.6152 6.55551 25.5298 6.46996C25.4443 6.38463 25.3502 6.34196 25.2475 6.34196H6.75217C6.6495 6.34196 6.55539 6.38463 6.46984 6.46996C6.3845 6.55551 6.34184 6.64963 6.34184 6.75229V25.2476C6.34184 25.3503 6.3845 25.4444 6.46984 25.53C6.55539 25.6153 6.6495 25.658 6.75217 25.658ZM8.9365 22.383H23.1878L18.8442 16.6L14.9108 21.648L12.1948 18.1246L8.9365 22.383Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
