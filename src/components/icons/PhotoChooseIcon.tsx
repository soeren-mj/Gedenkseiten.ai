import React from 'react';

interface PhotoChooseIconProps {
  size?: number;
  className?: string;
}

/**
 * PhotoChooseIcon - Icon for choosing/uploading a photo
 * Used in avatar selection wizard step
 */
export default function PhotoChooseIcon({ size = 16, className = '' }: PhotoChooseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask id="mask0_photo_choose" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
        <rect width="16" height="16" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_photo_choose)">
        <path
          d="M3.30951 14.0228C2.94818 14.0228 2.6359 13.8912 2.37268 13.628C2.10946 13.3648 1.97784 13.0525 1.97784 12.6912V3.31018C1.97784 2.94885 2.10946 2.63657 2.37268 2.37335C2.6359 2.11013 2.94818 1.97852 3.30951 1.97852H8.81018V3.10502H3.30951C3.24962 3.10502 3.20046 3.12424 3.16201 3.16268C3.12357 3.20113 3.10434 3.25029 3.10434 3.31018V12.6912C3.10434 12.7511 3.12357 12.8002 3.16201 12.8387C3.20046 12.8771 3.24962 12.8963 3.30951 12.8963H12.6905C12.7504 12.8963 12.7996 12.8771 12.838 12.8387C12.8765 12.8002 12.8957 12.7511 12.8957 12.6912V7.19052H14.0222V12.6912C14.0222 13.0525 13.8906 13.3648 13.6273 13.628C13.3641 13.8912 13.0518 14.0228 12.6905 14.0228H3.30951ZM4.05651 11.2887H11.9435L9.48851 8.00918L7.40984 10.7062L5.93934 8.85118L4.05651 11.2887ZM11.506 5.89135V4.50152H10.1093V3.37502H11.506V1.97852H12.6325V3.37502H14.0222V4.50152H12.6325V5.89135H11.506Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
