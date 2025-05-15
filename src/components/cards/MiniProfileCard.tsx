import React from 'react';
import Image from 'next/image';

interface MiniProfileCardProps {
  image: string;
  name: string;
  birth: string;
  death: string;
}

const MiniProfileCard: React.FC<MiniProfileCardProps> = ({ image, name, birth, death }) => (
  <div className="flex flex-col gap-[0.75rem] w-[170px] max-w-[158px] sm:max-w-[170px]">
    <div className="w-full aspect-square relative">
      <Image
        src={image}
        alt={name}
        fill
        className="rounded-[20px] object-cover"
      />
    </div>
    <div className="pl-2 flex flex-col gap-[0.75rem] w-full">
      <div className="font-inter font-medium text-[1.25rem] leading-[150%] text-black">{name}</div>
      <div className="font-inter font-medium text-xs leading-[165%] tracking-[0.0175em] text-[#636573]">
        <span>* {birth}</span><br />
        <span>† {death}</span>
      </div>
    </div>
  </div>
);

export default MiniProfileCard; 