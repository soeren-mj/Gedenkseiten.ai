import React from 'react';
import PreviewCardSlider from '@/components/cards/PreviewCardSlider';
import TagCloud from '@/components/ui/TagCloud';

const ContentSection: React.FC = () => {
  return (
    <section id="preview" className="w-full h-fit px-5 md:px-8 lg:px-[3.75rem] py-[3.75rem] flex flex-col gap-5">
      <div className="w-full max-w-[685px] h-fit flex flex-col gap-6 mx-auto">
        <h2 className="text-[28px] font-inter font-medium leading-[1.3] tracking-[-0.01em] text-center text-foreground-secondary flex flex-col items-center justify-center">
        Persönliche Gedenkseiten als digitales Andenken für Menschen und Tiere -
          <span className="block w-full text-center text-foreground-bw">
            Gedenkseiten für Jeden.
          </span>
        </h2>
        <p className="w-full h-fit text-center text-foreground-secondary font-inter text-base leading-[175%]">
          Erstellen Sie eine persönliche Gedenkseite, um die Erinnerung an Ihre Liebsten zu bewahren und mit anderen zu teilen.
        </p>
      </div>
      <PreviewCardSlider />
      <TagCloud />
    </section>
  );
};

export default ContentSection; 