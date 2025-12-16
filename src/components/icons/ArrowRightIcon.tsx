import { SVGProps } from 'react'

interface ArrowRightIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export default function ArrowRightIcon({ size = 28, className, ...props }: ArrowRightIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M16.3873 20.9148L14.9932 19.4991L19.5866 14.9056H4.62793V12.9342H19.5866L14.9812 8.32883L16.3754 6.93262L23.3722 13.9297L16.3873 20.9148Z"
        fill="currentColor"
      />
    </svg>
  )
}
