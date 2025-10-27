import React from 'react';

interface IconProps {
  className?: string;
}

export default function BellNotificationIcon({ className = '' }: IconProps) {
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
        id="mask0_6042_352536"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#mask0_6042_352536)">
        <path
          d="M4.5 18.8845V17.6282H6.30775V9.87575C6.30775 8.52392 6.72 7.32242 7.5445 6.27125C8.36917 5.21992 9.43767 4.56242 10.75 4.29875V3.75C10.75 3.40283 10.8714 3.10767 11.1143 2.8645C11.3571 2.6215 11.6519 2.5 11.9988 2.5C12.3458 2.5 12.641 2.6215 12.8845 2.8645C13.1282 3.10767 13.25 3.40283 13.25 3.75V4.29875C14.5623 4.56242 15.6308 5.21992 16.4555 6.27125C17.28 7.32242 17.6923 8.52392 17.6923 9.87575V17.6282H19.5V18.8845H4.5ZM11.9983 21.6922C11.5008 21.6922 11.0754 21.5152 10.7223 21.1612C10.3689 20.8072 10.1923 20.3817 10.1923 19.8845H13.8078C13.8078 20.3833 13.6306 20.8093 13.2763 21.1625C12.9219 21.5157 12.4959 21.6922 11.9983 21.6922Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
