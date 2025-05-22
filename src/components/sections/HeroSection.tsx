import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface HeroSectionProps {
  onStartClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartClick }) => {
  return (
    <section
      className="w-full relative flex flex-col justify-end min-h-[90vh] pb-8"
    >
      {/* Content Container */}
      <div className="w-full px-[1.25rem] md:px-[3.75rem] lg:px-[3.75rem]">
        <div className="w-full max-w-[113.75rem] mx-auto">
          <div className="w-full justify-between items-start px-[2rem]">
            <div className="w-full lg:max-w-[42.8125rem] flex flex-col gap-2 items-start">
              <div className="" style={{color: '#FE7678', fontFamily: 'Satoshi'}}>NEU und mit der Power von KI</div>
              <div>
                <h1>Digitale Gedenkseiten: Die moderne Art, Erinnerungen zu bewahren</h1>
              </div>
              <div className="text-xl md:text-[1.125rem] leading-[150%] max-w-full lg:max-w-[42.8125rem]" style={{color: '#C0C1CC', fontFamily: 'Inter'}}>
                In einer zunehmend digitalen Welt suchen immer mehr Menschen nach innovativen Wegen, das Andenken an unsere verstorbenen Lieben zu bewahren. Mit Gedenkseiten.ai kannst du deine Gedenkseite super schnell erstellen und mit deinen Lieben teilen.
              </div>
            </div>
            
            <div className="flex items-center mt-6 py-8 space-x-3">
                <div className="flex -space-x-4">
                  <div className="relative w-10 h-10 rounded-full border-1 border-white overflow-hidden">
                    <Image 
                      src="/images/foto of a man with basecap on a light background.png" 
                      alt="Mann mit Basecap" 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="relative w-10 h-10 rounded-full border-1 border-white overflow-hidden">
                    <Image 
                      src="/images/portrait of a woman-2.png" 
                      alt="Porträt einer Frau" 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="relative w-10 h-10 rounded-full border-1 border-white overflow-hidden">
                    <Image 
                      src="/images/selfie of a couple.png" 
                      alt="Selfie eines Paares" 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <p>Menschen wie du, die bereits angemeldet sind</p>
              </div>

            <div className="flex items-end py-6 self-stretch">
              <Button onClick={onStartClick}>Jetzt starten</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Background Image */}
      <img
        src="/images/Gedenkseiten-blur-79.webp"
        alt="Hero Background"
        className="pointer-events-none select-none absolute right-[-2vw] bottom-[-10vw] w-[60vw] max-w-[900px] h-auto object-contain z-0"
        aria-hidden="true"
      />
    </section>
  );
};

export default HeroSection; 