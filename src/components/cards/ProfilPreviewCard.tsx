import React, { useState } from 'react';
import Image from 'next/image';
import Reactions from '../ui/Reactions';

interface ProfilPreviewCardProps {
  name: string;
  birthDate: string;
  deathDate: string;
  imageUrl: string;
  description: string;
  reactions?: any[];
}

const ProfilPreviewCard: React.FC<ProfilPreviewCardProps> = ({
  name,
  birthDate,
  deathDate,
  imageUrl,
  description,
  reactions: propReactions
}) => {
  const [reactions, setReactions] = useState(propReactions);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-64">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <div className="text-gray-600 mb-4">
          <p>{birthDate} - {deathDate}</p>
        </div>
        <p className="text-gray-700 mb-6">{description}</p>
        <div className="mt-4">
          <Reactions onReactionChange={setReactions} />
        </div>
      </div>
    </div>
  );
};

export default ProfilPreviewCard; 