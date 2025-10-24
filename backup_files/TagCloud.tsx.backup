import React from 'react';

const tags = [
  'Profilbild',
  'AI-Funktionen',
  'Nachruf',
  'Geburts- und Sterbedaten',
  'Klassifizierung (Tiere)',
  'Gedenkspruch',
  'Rückblicke',
  'Termine',
  'Jubiläen',
  'Familienstammbaum',
  'Kondolenzbuch',
  'Reaktionen',
  'Fotos',
  'Videos',
  'Beiträge',
  'Gedenkkerzen',
  'Gedenkblumen',
  'Privatsphäre verwalten',
  'Freigebemanagement',
  'Verknüpfungen',
  'Erinnerungen'
];

const TagCloud: React.FC = () => {
  return (
    <div className="w-full py-[60px] flex flex-col gap-5">
      <h4 className="text-center">
        Mit diesen Funktionen machst du deine Gedenkseite einzigartig:
      </h4>
      <div className="flex flex-wrap justify-center gap-2 max-w-[1024px] mx-auto">
        {tags.map((tag, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-black text-white font-inter text-[14px] leading-[175%] tracking-[0.0175em] rounded-[6px]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagCloud; 