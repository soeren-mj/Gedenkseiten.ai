import React from 'react';
import PrimaryCard from '@/components/cards/PrimaryCard';
import TagCloudChips from '@/components/ui/TagCloudChips';
import MicrofonIcon from '@/components/icons/MicrofonIcon';
import HeftklammerIcon from '@/components/icons/HeftklammerIcon';
import ChatIcon from '@/components/icons/ChatIcon';
import BildverbesserungIcon from '@/components/icons/BildverbesserungIcon';
import AiCircleIcon from '@/components/icons/AiCircleIcon';
import SparklesIcon from '@/components/icons/SparklesIcon';

const AIUnterstuetzungSection: React.FC = () => {
  return (
    <section id="ai-unterstuetzung" className="w-full flex flex-col items-center max-w-[113.75rem] mx-auto py-[3.75rem] px-[1.25rem] md:px-[2rem] lg:px-[3.75rem] relative overflow-visible">
      {/* Dekoratives SVG-Hintergrundbild oben links */}
      <div className="pointer-events-none select-none absolute left-[-5rem] top-[-8rem] w-[48rem] max-w-[60vw] h-auto z-0" aria-hidden="true">
        <svg width="1092" height="1128" viewBox="0 0 1092 1128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_5498_57321)">
            <path d="M878 365.999C1090.5 500.499 956.5 929.999 857 999.499C757.5 1069 323 1017 195.5 777.999C67.9999 538.998 -183.5 152.498 -127.5 107.498C-71.5004 62.4981 665.5 231.499 878 365.999Z" fill="url(#paint0_linear_5498_57321)"/>
          </g>
          <defs>
            <filter id="filter0_f_5498_57321" x="-235.511" y="0.0820312" width="1326.63" height="1127.86" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur_5498_57321"/>
            </filter>
            <linearGradient id="paint0_linear_5498_57321" x1="0.500097" y1="56.4981" x2="783.5" y2="697.498" gradientUnits="userSpaceOnUse">
              <stop stopColor="#78D584"/>
              <stop offset="0.355769" stopColor="#DF72E7"/>
              <stop offset="0.6875" stopColor="#D83CAC"/>
              <stop offset="1" stopColor="#FF595C"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Grid-Layout */}
      <div className="w-full max-w-[113.75rem] grid grid-cols-1 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-6 auto-rows-fr relative z-10">
        {/* Headline-Box: nimmt zwei Spalten, eine Zeile */}
        <div className="col-span-2 row-span-1 flex flex-col items-start justify-center gap-4 bg-transparent p-0 z-10">
          <SparklesIcon className="w-16 h-16 text-white fill-white" />
          <div className="" style={{color: '#F2F0EB', fontFamily: 'Satoshi'}}>coming soon</div>
          <h2>
            In nur einem Schritt zur digitalen Gedenkseite.
          </h2>
          <p className="text-[1.125rem] leading-[1.4] tracking-[-0.5%] text-white">
            Mit nur einem kleinen Chat füllst du deine Gedenkseite automatisch. 
            <br /> 
            Lass dir auch bei Texten helfen und deine Bilder verbessern.
          </p>
        </div>
        {/* Leere Zellen rechts neben der Headline */}
        <div className="col-span-1 row-span-1" />
        <div className="col-span-1 row-span-1" />
        {/* PrimaryCard 1 */}
        <div className="row-span-1">
          <PrimaryCard
            icon={<BildverbesserungIcon className="w-8 h-8" />}
            headline="KI-Bildverbesserung"
            description="Verbessere die Bildqualität deiner Fotos mit unserer KI."
            image="/images/ai-bildverbesserung-before-after.png"
            cardHeight="20rem"
          />
        </div>
        {/* PrimaryCard 2 */}
        <div className="row-span-1">
          <PrimaryCard
            icon={<ChatIcon className="w-8 h-8" />}
            headline="KI-Textunterstützung"
            description="KI-generierte Textvorschläge für einen pietätvollen Nachruf oder Gedenksprüche."
            image="/images/ai-textunterstuetzung-ideation.png"
            cardHeight="20rem"
          />
        </div>
        {/* Großes Chat-Element (nimmt zwei Zeilen ein) */}
        <div className="md:row-span-2 col-span-2 flex flex-col p-5 justify-center gap-6 bg-black/40 rounded-2xl border border-black shadow-[1px_1px_10px_1px_rgba(210,211,217,0.20)] backdrop-blur-[61px] min-h-[300px]">
          {/* Chat-Header */}
          <div className="p-6 bg-black/40 rounded-xl">
            <h4>Erzähl mir, für wen möchtest du eine Gedenkseite erstellen?</h4>
              <div className="pt-4">
               <p className="text-[1.25rem] leading-[1.5] bg-gradient-to-br from-[#FB405B] to-[#E3894E] bg-clip-text text-transparent">
                Ich möchte gern eine Seite für meine verstorbene Omi erstellen. Sie ist am 28.10.2023 in Recklinghausen gestorben. Ihr Name ist Jaune Pierre Mont-Dereville. Ihr Geburtsdatum war der 01.08.1946.
               </p>
               <div className="w-full flex items-center justify-end gap-2 mt-6">
                <MicrofonIcon className="w-8 h-8" />
                <HeftklammerIcon className="w-8 h-8" />
               </div>
              </div>
           </div>
          {/* Denk-Status */}
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="inline-block w-4 h-4 bg-gradient-to-br from-[#8FC6F5] via-[#AD9CF5] to-[#F361F5] rounded-full animate-pulse" />
            <span className="font-inter font-semibold text-base leading-[1.6] bg-gradient-to-br from-[#8FC6F5] via-[#AD9CF5] to-[#F361F5] bg-clip-text text-transparent">Denkt nach…</span>
          </div>
          {/* TagCloud */}
          <div className="p-4">
            <TagCloudChips
              label="Informationen erkannt:"
              tags={[
                'Person',
                'Sterbedatum: 28.10.2023',
                'Sterbeort: Recklinghausen',
                'Vorname: Jaune Pierre',
                'Nachname: Mont-Dereville',
                'Geburtsdatum: 01.08.1946',
              ]}
            />
          </div>
          {/* Ready to go */}
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="font-inter font-semibold text-base leading-[1.6] bg-gradient-to-br from-[#8FC6F5] via-[#AD9CF5] to-[#F361F5] bg-clip-text text-transparent animate-pulse">Ich habe genügend Informationen, um eine Gedenkseite zu erstellen…</span>
          </div>
        </div>
        {/* Große PrimaryCard (nimmt zwei Spalten ein) */}
        <div className="col-span-2 row-span-1">
          <PrimaryCard
            icon={<AiCircleIcon className="w-8 h-8" />}
            headline="KI-gestützte Inhaltserstellung"
            description="Generiert Vorschläge basierend auf den Inhalten der Gedenkseite."
            image="/images/ai-inhaltserstellung-abstract.png"
            variant="large"
            cardHeight="20rem"
          />
        </div>
      </div>
    </section>
  );
};

export default AIUnterstuetzungSection; 