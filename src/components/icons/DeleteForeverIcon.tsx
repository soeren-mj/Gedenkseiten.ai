import React from 'react';

interface DeleteForeverIconProps {
  size?: number;
  className?: string;
}

/**
 * DeleteForeverIcon - Trash icon with X for permanent deletion
 * Used in avatar selection wizard step when photo is uploaded
 */
export default function DeleteForeverIcon({ size = 16, className = '' }: DeleteForeverIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask id="mask0_delete_forever" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
        <rect width="16" height="16" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_delete_forever)">
        <path
          d="M6.147 10.776L8 8.9052L9.86416 10.776L10.4923 10.141L8.63932 8.2702L10.4923 6.39484L9.86416 5.75984L8 7.63084L6.147 5.75984L5.50768 6.39484L7.37184 8.2702L5.50768 10.141L6.147 10.776ZM4.71632 13.6667C4.42976 13.6667 4.18432 13.5645 3.98 13.3602C3.77567 13.1558 3.6735 12.9104 3.6735 12.6238V3.75635H3V2.91885H5.90084V2.41035H10.0992V2.91885H13V3.75635H12.3265V12.6238C12.3265 12.9104 12.2243 13.1558 12.02 13.3602C11.8157 13.5645 11.5702 13.6667 11.2837 13.6667H4.71632ZM11.4888 3.75635H4.51116V12.6238C4.51116 12.6752 4.5325 12.7222 4.57516 12.765C4.61796 12.8077 4.665 12.829 4.71632 12.829H11.2837C11.335 12.829 11.382 12.8077 11.4248 12.765C11.4675 12.7222 11.4888 12.6752 11.4888 12.6238V3.75635Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
