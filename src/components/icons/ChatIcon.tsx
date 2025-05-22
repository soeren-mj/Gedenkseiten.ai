import * as React from 'react';

const ChatIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <mask id="mask0_5498_57297" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="33">
      <rect y="0.5" width="32" height="32" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_5498_57297)">
      <path d="M8.3335 18.8477H18.2205V17.1723H8.3335V18.8477ZM8.3335 14.6853H23.6668V13.01H8.3335V14.6853ZM8.3335 10.523H23.6668V8.84765H8.3335V10.523ZM3.3335 28.552V5.91965C3.3335 5.34654 3.53783 4.85565 3.9465 4.44698C4.35516 4.03832 4.84605 3.83398 5.41916 3.83398L26.5812 3.83398C27.1543 3.83398 27.6452 4.03832 28.0538 4.44698C28.4625 4.85565 28.6668 5.34654 28.6668 5.91965V21.7483C28.6668 22.3214 28.4625 22.8123 28.0538 23.221C27.6452 23.6297 27.1543 23.834 26.5812 23.834H8.0515L3.3335 28.552ZM7.32683 22.1587H26.5812C26.6838 22.1587 26.7779 22.116 26.8635 22.0307C26.9488 21.9451 26.9915 21.851 26.9915 21.7483V5.91965C26.9915 5.81698 26.9488 5.72287 26.8635 5.63732C26.7779 5.55198 26.6838 5.50932 26.5812 5.50932H5.41916C5.3165 5.50932 5.22239 5.55198 5.13683 5.63732C5.0515 5.72287 5.00883 5.81698 5.00883 5.91965V24.569L7.32683 22.1587Z" fill="url(#paint0_linear_5498_57297)" />
    </g>
    <defs>
      <linearGradient id="paint0_linear_5498_57297" x1="2.97141" y1="12.7494" x2="25.032" y2="23.2271" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8FC6F5" />
        <stop offset="0.495192" stopColor="#AD9CF5" />
        <stop offset="1" stopColor="#F361F5" />
      </linearGradient>
    </defs>
  </svg>
);

export default ChatIcon; 