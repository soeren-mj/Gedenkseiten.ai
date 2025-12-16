interface LogoutIconProps {
  className?: string;
  size?: number;
}

export default function LogoutIcon({ className = '', size = 24 }: LogoutIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask_logout"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask_logout)">
        <path
          d="M5.06425 20.5C4.63442 20.5 4.26625 20.3467 3.95975 20.0402C3.65325 19.7337 3.5 19.3656 3.5 18.9357V5.06425C3.5 4.63442 3.65325 4.26625 3.95975 3.95975C4.26625 3.65325 4.63442 3.5 5.06425 3.5H11.9992V4.7565H5.06425C4.98725 4.7565 4.91667 4.7885 4.8525 4.8525C4.7885 4.91667 4.7565 4.98725 4.7565 5.06425V18.9357C4.7565 19.0127 4.7885 19.0833 4.8525 19.1475C4.91667 19.2115 4.98725 19.2435 5.06425 19.2435H11.9992V20.5H5.06425ZM16.5487 15.9615L15.6525 15.0628L18.0872 12.6282H9.09625V11.3717H18.0667L15.632 8.93725L16.5217 8.032L20.5 12.0135L16.5487 15.9615Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
