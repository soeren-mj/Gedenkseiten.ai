'use client';
import React from 'react';
import Button from '@/components/ui/Button';
import PreviewSection from '@/components/sections/PreviewSection';
import SoWhatSection from '@/components/sections/SoWhatSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { Faq1 } from '@/components/blocks/faq1';
import PopoverRegister from '@/components/ui/PopoverRegister';
import AIUnterstuetzungSection from '@/components/sections/AIUnterstuetzungSection';

export default function Home() {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const onStartClick = () => setPopoverOpen(true);

  return (
    <div className="w-full">
      <PopoverRegister open={popoverOpen} onClose={() => setPopoverOpen(false)} />
      <HeroSection
        title="Digitale Gedenkseiten: Die moderne Art, Erinnerungen zu bewahren"
        description="In einer zunehmend digitalen Welt suchen immer mehr Menschen nach innovativen Wegen, das Andenken an unsere verstorbenen Lieben zu bewahren. Mit Gedenkseiten.ai kannst du deine Gedenkseite super schnell erstellen und mit deinen Lieben teilen."
        tag={{
          text: 'NEU und mit der Power von KI',
          color: 'red',
        }}
        primaryButton={{
          text: 'Jetzt starten',
          onClick: onStartClick,
        }}
        avatarGroup={{
          images: [
            { src: '/images/foto of a man with basecap on a light background.png', alt: 'Mann mit Basecap' },
            { src: '/images/portrait of a woman-2.png', alt: 'Porträt einer Frau' },
            { src: '/images/selfie of a couple.png', alt: 'Selfie eines Paares' },
          ],
          text: 'Menschen wie du, die bereits angemeldet sind',
        }}
        backgroundImage={{
          src: '/images/Gedenkseiten-blur-79.webp',
          alt: 'Hero Background',
        }}
      />
      <SoWhatSection onStartClick={onStartClick} />
      <AIUnterstuetzungSection />
      <PreviewSection />
      {/* Neue Section mit zentriertem Button */}
      <section className="w-full px-4 md:px-[60px] py-6 flex justify-center items-center mt-10">
        <Button onClick={onStartClick}>Jetzt starten</Button>
      </section>
      {/* FAQ Section */}
      <Faq1 />
    </div>
  );
}
