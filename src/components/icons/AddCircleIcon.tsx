import React from 'react';

interface IconProps {
  className?: string;
}

export default function AddCircleIcon({ className = '' }: IconProps) {
  return (
    <svg
      width="40"
      height="41"
      viewBox="0 0 40 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-colors duration-200 ${className}`}
    >
      <style>{`
        .add-circle-icon-path {
          fill: var(--bg-interactive-primary-default);
          transition: fill 0.2s ease-in-out;
        }
        svg:hover .add-circle-icon-path {
          fill: var(--border-interactive-info-hover);
        }
        svg:active .add-circle-icon-path {
          fill: var(--border-interactive-info-hover);
        }
      `}</style>
      <mask
        id="mask0_6216_47932"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="41"
      >
        <rect y="0.5" width="40" height="40" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#mask0_6216_47932)">
        <path
          className="add-circle-icon-path"
          d="M19.3354 27.9998H20.7458V21.2518H27.5V19.8418H20.7458V12.9998H19.3354V19.8418H12.5V21.2518H19.3354V27.9998ZM20.0129 35.4998C17.9293 35.4998 15.9803 35.1061 14.1658 34.3189C12.3511 33.5317 10.7638 32.4588 9.40375 31.1002C8.04375 29.7413 6.96986 28.1548 6.18208 26.3406C5.39403 24.5261 5 22.5764 5 20.4914C5 18.4206 5.39361 16.4736 6.18083 14.6506C6.96806 12.8275 8.04097 11.2406 9.39958 9.88976C10.7585 8.53892 12.345 7.46962 14.1592 6.68184C15.9736 5.89378 17.9233 5.49976 20.0083 5.49976C22.0792 5.49976 24.0261 5.89337 25.8492 6.68059C27.6722 7.46781 29.2592 8.53615 30.61 9.88559C31.9608 11.235 33.0301 12.822 33.8179 14.6464C34.606 16.4706 35 18.4174 35 20.4868C35 22.5705 34.6064 24.5195 33.8192 26.3339C33.0319 28.1486 31.9636 29.7342 30.6142 31.0906C29.2647 32.4473 27.6778 33.5213 25.8533 34.3127C24.0292 35.1041 22.0824 35.4998 20.0129 35.4998ZM20.0138 34.0893C23.7896 34.0893 26.9963 32.7696 29.6338 30.1302C32.271 27.4905 33.5896 24.2757 33.5896 20.486C33.5896 16.7102 32.2726 13.5035 29.6388 10.866C27.0049 8.22878 23.7919 6.91017 20 6.91017C16.2194 6.91017 13.0093 8.22712 10.3696 10.861C7.73014 13.4949 6.41042 16.7078 6.41042 20.4998C6.41042 24.2803 7.73014 27.4905 10.3696 30.1302C13.0093 32.7696 16.224 34.0893 20.0138 34.0893Z"
        />
      </g>
    </svg>
  );
}
