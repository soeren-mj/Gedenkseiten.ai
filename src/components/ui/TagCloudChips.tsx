import React from 'react';

interface TagCloudChipsProps {
  label?: string;
  tags: string[];
}

const TagCloudChips: React.FC<TagCloudChipsProps> = ({ label, tags }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="font-inter font-semibold text-[#F0F0F2] text-sm mb-1">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-3">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-black text-[#F0F0F2] rounded-[6px] px-2 py-1 font-inter text-[14px] font-medium leading-[1.75] tracking-[0.0175em]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagCloudChips; 