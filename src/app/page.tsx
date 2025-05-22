'use client';
import React from 'react';
import Button from '@/components/ui/Button';
import PreviewSection from '@/components/sections/PreviewSection';
import SoWhatSection from '@/components/sections/SoWhatSection';
import HeroSection from '@/components/sections/HeroSection';
import { Faq1 } from '@/components/blocks/faq1';
import PopoverRegister from '@/components/ui/PopoverRegister';
import AIUnterstuetzungSection from '@/components/sections/AIUnterstuetzungSection';

export default function Home() {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const onStartClick = () => setPopoverOpen(true);

  return (
    <main className="min-h-screen items-center" style={{ background: '#1F2024' }}>
      <PopoverRegister open={popoverOpen} onClose={() => setPopoverOpen(false)} />
      <HeroSection onStartClick={onStartClick} />
      <SoWhatSection onStartClick={onStartClick} />
      <AIUnterstuetzungSection />
      <PreviewSection />
      {/* Neue Section mit zentriertem Button */}
      <section className="w-full px-[60px] py-6 flex justify-center items-center mt-10">
        <Button onClick={onStartClick}>Jetzt starten</Button>
      </section>
      {/* FAQ Section */}
      <Faq1 />
    </main>
  );
}
