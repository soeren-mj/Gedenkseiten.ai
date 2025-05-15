import React from 'react';
import Button from '@/components/ui/Button';

const HeroSection = () => {
  return (
    <section className="w-full pt-[120px] md:pt-[150px] lg:pt-[180px] relative">
      {/* Content Container */}
      <div className="w-full px-5 md:px-8 lg:px-[60px]">
        <div className="w-full max-w-[1820px] mx-auto">
          <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-0 px-8">
            <div className="w-full lg:max-w-[685px] flex flex-col gap-2 items-start">
              <div className="text-[16px] font-[500] leading-[22px]" style={{color: '#92A1FC', fontFamily: 'Satoshi'}}>NEU</div>
              <div className="text-[32px] md:text-[38px] lg:text-[44px] font-[500] leading-[1.2] md:leading-[1.3] lg:leading-[52.8px]" style={{color: '#F0F0F2', fontFamily: 'Satoshi', wordBreak: 'break-word'}}>
                Digitale Gedenkseiten: Die moderne Art, Erinnerungen zu bewahren
              </div>
              <div className="text-[16px] md:text-[17px] lg:text-[18px] font-[500] leading-[28px] max-w-full lg:max-w-[685px]" style={{color: '#C0C1CC', fontFamily: 'Inter'}}>
                In einer zunehmend digitalen Welt suchen immer mehr Menschen nach innovativen Wegen, das Andenken an unsere verstorbenen Lieben zu bewahren. Mit Gedenkseiten.ai kannst du deine Gedenkseite super schnell erstellen und mit deinen Lieben teilen.
              </div>
            </div>
            <div className="flex items-end gap-4 self-stretch">
              <Button>Jetzt starten</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image Container */}
      <div className="w-full h-[300px] md:h-[350px] lg:h-[421px] mt-6 md:mt-8 lg:mt-[40px]">
        <div className="w-full h-full relative">
          <div className="absolute inset-0 ml-5 md:ml-8 lg:ml-[60px] rounded-l-[40px]" style={{background: '#F0F0F2', boxShadow: '11px 11px 61px 2px rgba(255,255,255,0.25) inset', overflow: 'hidden'}}>
            <img className="absolute inset-0 w-full h-full object-cover" src="/hero-bg.png" alt="Hero Background" />
            <img className="absolute inset-0 w-full h-full object-cover" src="/noiseeffect-bg.png" alt="Blur Shape" style={{mixBlendMode: 'overlay'}} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 