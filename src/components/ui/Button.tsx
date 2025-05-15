import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'm' | 's';
  children?: React.ReactNode;
}

export default function Button({
  children = 'Jetzt starten',
  disabled = false,
  size = 'm',
  ...props
}: ButtonProps) {
  const sizeClasses = size === 's'
    ? 'px-3 py-[10px] min-w-[64px] h-[34px] text-[12px] leading-[14.4px] rounded-[6px] gap-2'
    : 'min-w-[180px] h-[44px] px-5 py-3 text-[16px] leading-[16px] rounded-[11px] gap-3';

  return (
    <button
      className={`
        font-[500] inline-flex justify-center items-center
        bg-[#475EEC] text-white
        shadow-[1px_1px_10px_1px_rgba(210,211,217,0.20)]
        backdrop-blur-[30.5px]
        transition
        focus:outline-none focus:ring-2 focus:ring-[#92A1FC] focus:ring-offset-2
        disabled:bg-[#858585] disabled:text-[#C0C1CC] disabled:cursor-not-allowed
        hover:bg-[#3a4ecb] active:bg-[#2c3a99]
        ${sizeClasses}
      `}
      style={{ fontFamily: 'Inter', letterSpacing: size === 's' ? '0.18px' : undefined }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
} 