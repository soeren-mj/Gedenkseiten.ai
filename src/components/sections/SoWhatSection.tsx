import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import PrimaryCard from '@/components/cards/PrimaryCard';

interface SoWhatSectionProps {
  onStartClick?: () => void;
}

// Updated component with WebP images
function SoWhatNumberBox({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex w-full items-center justify-center gap-6 p-2 md:py-0">
      <div className="flex items-center">
        <Image
          src={`/images/${number}-number-blur.webp`}
          alt={`Number ${number} with progressive blur gradient effect`}
          className="h-[8rem] w-auto"
          width={84}
          height={84}
          style={{ objectFit: 'contain' }}
        />
        <span className="sr-only">{number}</span>
      </div>
      <h4 className="w-full">
        {text}
      </h4>
    </div>
  );
}

const SoWhatSection: React.FC<SoWhatSectionProps> = ({ onStartClick }) => {
  return (
    <section id="so-what" className="w-full flex flex-col items-center gap-5 md:gap-6 lg:gap-10 mt-20">
      <div className="w-full max-w-[113.75rem] px-5 md:px-8 lg:px-[3.75rem] py-[3.75rem] flex flex-col items-center">
        <div className="flex items-center w-full lg:w-full md:w-fit p-2 md:px-2 lg:px-8 pb-5 md:pb-5 lg:pb-[3.75rem]">
          <div className="max-w-[685px] text-subsection-h3 text-tertiary">
            <span className="text-primary">Moderne ansprechende Gedenkseiten</span>
            {' '}sind, im Gegensatz zu traditionellen Erinnerungsformen wie gedruckten Fotos, Alben oder Trauerkarten, jederzeit und durch fast jeden von überall zugänglich. Sie bieten einen Raum, in dem Freunde und Familie ihre Trauer ausdrücken und sich gegenseitig unterstützen können. Auch wenn Menschen nicht persönlich an der Beerdigung oder Trauerfeier teilnehmen können, haben diese die Möglichkeit, online ihr Beileid auszudrücken und Unterstützung zu zeigen. Diese gemeinschaftliche Trauerbewältigung kann sehr heilend wirken.
          </div>
        </div>
        <div className="w-full flex flex-row flex-wrap py-8 justify-center gap-5 md:gap-6 lg:gap-[2.5rem]">
          {/* Spalte 1 */}
          <div className="flex flex-col gap-5 md:gap-6 lg:gap-[2.5rem] min-w-[20rem] max-w-[22.875rem] flex-1">
            <SoWhatNumberBox number="1" text="Erleichtert eine würdevolle Trauerbewältigung" />
            <PrimaryCard
              icon="encrypted"
              headline="Respektiert die Privatsphäre"
              description="Entscheide selbst, wie deine Seiten zu finden sind. So schützt du die Privatsphäre nach deinen Wünschen."
              image="/images/status-gedenkseite.png"
              imageAlt="Sicherheit und Privatsphäre bei digitalen Gedenkseiten - Individuelle Einstellungen für den Zugriff"
              cardHeight="30.5rem"
            />
            <PrimaryCard
              icon="support"
              headline="Unterstützend im Trauerprozess"
              description="Gedenkseiten bieten eine Plattform um Trauer auszudrücken und sich gegenseitig zu unterstützen. Dies kann therapeutisch wirken und den Trauerprozess erleichtern."
              image="/images/zitat-trauerprozess.png"
              imageAlt="Digitale Unterstützung im Trauerprozess - Gemeinsames Trauern und Erinnern"
              cardHeight="30.5rem"
            />
          </div>
          {/* Spalte 2 */}
          <div className="flex flex-col gap-5 md:gap-6 lg:gap-[2.5rem] min-w-[20rem] max-w-[22.875rem] flex-1">
            <SoWhatNumberBox number="2" text="Stärkt das Gemeinschaftsgefühl" />
            <PrimaryCard
              icon="chat"
              headline="Beileid online ausdrücken"
              description="Online Gedenkseiten ermöglichen es, Beileid auszudrücken und Geschichten zu teilen, auch wenn persönliche Präsenz nicht möglich ist."
              image="/images/feed-gedenkseite.png"
              imageAlt="Digitales Kondolenzbuch und Beileidsbekundungen auf der Gedenkseite"
              cardHeight="30.5rem"
            />
            <PrimaryCard
              icon="connect"
              headline="Verbindet miteinander"
              description="Heute leben wir oft an verschiedenen Orten und sind über soziale Netzwerke verbunden. Wir bringen Menschen in schweren Zeiten zusammen, etwa mit einem digitalen Kondolenzbuch."
              image="/images/kondolenzbuch-gedenkseite.png"
              imageAlt="Digitale Verbindung und Gemeinschaft durch Gedenkseiten - Virtuelles Beisammensein in der Trauer"
              cardHeight="30.5rem"
            />
          </div>
          {/* Spalte 3 */}
          <div className="flex flex-col gap-5 md:gap-6 lg:gap-[2.5rem] min-w-[20rem] max-w-[22.875rem] flex-1">
            <SoWhatNumberBox number="3" text="Schafft eine moderne, zugängliche Erinnerung" />
            <PrimaryCard
              icon="media"
              headline="Multimediale Inhalte erwecken deine Gedenkseite zum Leben"
              description="Sowohl Seitenerstellende als auch Gedenkende haben viele Möglichkeiten Gedenkseiten zum Leben zu erwecken."
              image="/images/erinnerung-gedenkseite.png"
              imageAlt="Multimediale Erinnerungen auf der digitalen Gedenkseite - Fotos, Videos und persönliche Geschichten"
              cardHeight="30.5rem"
            />
            <PrimaryCard
              icon="modern"
              headline="Ein zeitgemäßes Gesamtbild"
              description="Die Gedenkseiten für Verstorbene sollen durch die Inhalte der Gedenkenden lebendig werden. Daher wählen wir ein schlichtes Design – Geschmäcker sind verschieden."
              image="/images/Gedenkseite-vorschau.png"
              imageAlt="Moderne und würdevoll gestaltete digitale Gedenkseite - Individuelles Design für persönliche Erinnerungen"
              cardHeight="30.5rem"
            />
          </div>
        </div>
        <div className="w-[22.5rem] pt-[3.75rem] flex justify-center items-center">
        <Button 
                variant="primary"
                size="md"
                onClick={onStartClick}
              >
                Jetzt starten
              </Button>
        </div>
      </div>
    </section>
  );
};

export default SoWhatSection; 