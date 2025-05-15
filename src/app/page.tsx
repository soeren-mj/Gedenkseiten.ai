'use client';
import React from 'react';
import Button from '@/components/ui/Button';
import PrimaryCard from '@/components/cards/PrimaryCard';
import PreviewSection from '@/components/sections/PreviewSection';
import CreateMemorialSection from '@/components/sections/CreateMemorialSection';
import SoWhatSection from '@/components/sections/SoWhatSection';
import HeroSection from '@/components/sections/HeroSection';
import { Faq1 } from '@/components/blocks/faq1';

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#1F2024' }}>
      <HeroSection />
      <SoWhatSection />
      <PreviewSection />
      <CreateMemorialSection />
      {/* Neue Section mit zentriertem Button */}
      <section className="w-full px-[60px] py-6 flex justify-center items-center mt-10">
        <Button>Jetzt starten</Button>
      </section>
      {/* FAQ Section */}
      <Faq1 />
    </main>
  );
}
