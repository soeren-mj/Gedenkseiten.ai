interface VisuelleErinnerungenIconProps {
  className?: string;
  size?: number;
}

export default function VisuelleErinnerungenIcon({ className = '', size = 48 }: VisuelleErinnerungenIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask0_visuelle_erinnerungen"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="48"
        height="48"
      >
        <rect width="48" height="48" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_visuelle_erinnerungen)">
        <path
          d="M2.76953 37V11H5.28203V37H2.76953ZM11 37V11H13.513V37H11ZM22.359 37C21.4994 37 20.763 36.6935 20.15 36.0805C19.5374 35.4675 19.231 34.7312 19.231 33.8715V14.1285C19.231 13.2688 19.5374 12.5325 20.15 11.9195C20.763 11.3065 21.4994 11 22.359 11H42.1025C42.9622 11 43.6985 11.3065 44.3115 11.9195C44.9242 12.5325 45.2305 13.2688 45.2305 14.1285V33.8715C45.2305 34.7312 44.9242 35.4675 44.3115 36.0805C43.6985 36.6935 42.9622 37 42.1025 37H22.359ZM22.359 34.487H42.1025C42.2565 34.487 42.3975 34.423 42.5255 34.295C42.6539 34.1667 42.718 34.0255 42.718 33.8715V14.1285C42.718 13.9745 42.6539 13.8333 42.5255 13.705C42.3975 13.577 42.2565 13.513 42.1025 13.513H22.359C22.2054 13.513 22.0644 13.577 21.936 13.705C21.8077 13.8333 21.7435 13.9745 21.7435 14.1285V33.8715C21.7435 34.0255 21.8077 34.1667 21.936 34.295C22.0644 34.423 22.2054 34.487 22.359 34.487ZM24.6925 29.8435H39.864L35.2205 23.628L31.231 28.872L28.3155 24.982L24.6925 29.8435Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
