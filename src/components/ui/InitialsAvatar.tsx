import React from 'react';

interface InitialsAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ 
  name, 
  size = 'md',
  className = ''
}) => {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-xs',
    md: 'w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-xs',
    lg: 'w-6 h-6 sm:w-10 sm:h-10 text-xs sm:text-md'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-[#92A1FC]
        text-white
        flex
        items-center
        justify-center
        font-medium
        overflow-hidden
        shrink-0
        ${className}
      `}
    >
      {getInitials(name)}
    </div>
  );
};

export default InitialsAvatar; 