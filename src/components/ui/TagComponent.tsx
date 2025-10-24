import React from 'react';

// Simple Tag Component
interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, className = '' }) => {
  return (
    <span 
      className={`
        inline-block px-3 py-1.5 rounded-xxs
        bg-bw text-bw
        text-tag
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Tag Cloud Component
interface TagCloudProps {
  tags: string[];
  title?: string;
  className?: string;
}

export const TagCloud: React.FC<TagCloudProps> = ({ tags, title, className = '' }) => {
  return (
    <div className={`w-full py-[3.75rem] flex flex-col gap-5 ${className}`}>
      {title && (
        <h4 className="text-center">
          {title}
        </h4>
      )}
      <div className="flex flex-wrap justify-center gap-2 max-w-[1024px] mx-auto">
        {tags.map((tag, index) => (
          <Tag key={`${tag}-${index}`}>
            {tag}
          </Tag>
        ))}
      </div>
    </div>
  );
};
