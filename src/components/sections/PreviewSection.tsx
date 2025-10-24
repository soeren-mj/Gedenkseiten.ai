import React from 'react';
import PreviewCardSlider from '@/components/cards/PreviewCardSlider';
import { TagCloud } from '@/components/ui/TagComponent';


const ContentSection: React.FC = () => {
  return (
    <section id="preview" className="w-full h-fit px-4 md:px-8 lg:px-[3.75rem] py-[3.75rem] flex flex-col gap-5">
      <div className="w-full max-w-[685px] h-fit flex flex-col gap-6 mx-auto">
        <h2 className="text-center text-secondary flex flex-col items-center justify-center">
        Persönliche Gedenkseiten als digitales Andenken für Menschen und Tiere -
          <span className="block w-full text-center text-bw">
            Gedenkseiten für Jeden.
          </span>
        </h2>
        <p className="text-center text-secondary">
          Erstellen Sie eine persönliche Gedenkseite, um die Erinnerung an Ihre Liebsten zu bewahren und mit anderen zu teilen.
        </p>
      </div>
      <PreviewCardSlider />
      <TagCloud 
  tags={['Profilbild', 'AI-Funktionen', 'Nachruf', 'Geburts- und Sterbedaten', 'Klassifizierung (Tiere)', 'Gedenkspruch', 'Rückblicke', 'Termine', 'Jubiläen', 'Familienstammbaum', 'Kondolenzbuch', 'Reaktionen', 'Fotos', 'Videos', 'Beiträge', 'Gedenkkerzen', 'Gedenkblumen', 'Privatsphäre verwalten', 'Freigebemanagement', 'Verknüpfungen', 'Erinnerungen']}
  title="Mit diesen Funktionen machst du deine Gedenkseite einzigartig:"
/>
    </section>
  );
};

export default ContentSection; 