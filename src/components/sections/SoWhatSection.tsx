import React from 'react';
import Button from '@/components/ui/Button';
import PrimaryCard from '@/components/cards/PrimaryCard';

// Neue Komponente für die Zahlen-Box
function SoWhatNumberBox({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex min-w-[17.5rem] max-w-[22.875rem] w-full p-2 items-center justify-center gap-4">
      <span className="text-[5.25rem] font-medium leading-[100%] font-satoshi flex items-center relative">
        {number === "1" ? (
          <span 
            className="bg-[url('/images/1-gradient-hintergrund.png')] bg-no-repeat bg-center bg-cover text-transparent bg-clip-text w-[5.25rem] h-[5.25rem] flex items-center justify-center"
          >
            {number}
          </span>
        ) : number === "2" ? (
          <span 
            className="bg-[url('/images/2-gradient-hintergrund.png')] bg-no-repeat bg-center bg-cover text-transparent bg-clip-text w-[5.25rem] h-[5.25rem] flex items-center justify-center"
          >
            {number}
          </span>
        ) : number === "3" ? (
          <span 
            className="bg-[url('/images/3-gradient-hintergrund.png')] bg-no-repeat bg-center bg-cover text-transparent bg-clip-text w-[5.25rem] h-[5.25rem] flex items-center justify-center"
          >
            {number}
          </span>
        ) : (
          <span className="text-foreground-interactiv-accents-orange">
            {number}
          </span>
        )}
      </span>
      <h4 className="self-center text-foreground-primary flex items-center">
        {text}
      </h4>
    </div>
  );
}

const SoWhatSection: React.FC = () => {
  return (
    <section id="so-what" className="w-full flex flex-col items-center gap-5 md:gap-6 lg:gap-10 mt-10">
      <div className="w-full max-w-[1820px] px-5 md:px-8 lg:px-[3.75rem] py-[3.75rem] flex flex-col items-center">
        <div className="flex items-center w-full lg:w-full md:w-fit px-2 md:px-2 lg:px-8 pb-5 md:pb-5 lg:pb-[3.75rem]">
          <div className="max-w-[685px] text-foreground-secondary font-inter text-lg md:text-xl lg:text-2xl font-medium leading-[130%] md:leading-[140%] lg:leading-[140%] tracking-[-0.005rem]">
            <span className="text-foreground-bw">Moderne ansprechende Gedenkseiten</span>
            {' '}sind, im Gegensatz zu traditionellen Erinnerungsformen wie gedruckten Fotos, Alben oder Trauerkarten, jederzeit und durch fast jeden von überall zugänglich. Sie bieten einen Raum, in dem Freunde und Familie ihre Trauer ausdrücken und sich gegenseitig unterstützen können. Auch wenn Menschen nicht persönlich an der Beerdigung oder Trauerfeier teilnehmen können, haben diese die Möglichkeit, online ihr Beileid auszudrücken und Unterstützung zu zeigen. Diese gemeinschaftliche Trauerbewältigung kann sehr heilend wirken.
          </div>
        </div>
        <div className="w-full flex flex-row flex-wrap justify-center gap-5 md:gap-6 lg:gap-[2.5rem]">
          {/* Spalte 1 */}
          <div className="flex flex-col gap-5 md:gap-6 lg:gap-[2.5rem] min-w-[20rem] max-w-[22.875rem] flex-1">
            <SoWhatNumberBox number="1" text="Erleichtert eine würdevolle Trauerbewältigung" />
            <PrimaryCard
              icon="encrypted"
              headline="Respektiert die Privatsphäre"
              description="Du hast die Wahl wie deine Seiten zu finden sind. So wird die gewünschte Privatsphäre geschützt."
              image="/images/status-gedenkseite.png"
              imageAlt="Sicherheit und Privatsphäre bei digitalen Gedenkseiten - Individuelle Einstellungen für den Zugriff"
            />
            <PrimaryCard
              icon="support"
              headline="Unterstützend im Trauerprozess"
              description="Gedenkseiten bieten eine Plattform für Angehörige und Freunde, die ihre Trauer auszudrücken und sich gegenseitig zu unterstützen wollen. Dies kann therapeutisch wirken und den Trauerprozess erleichtern."
              image="/images/zitat-trauerprozess.png"
              imageAlt="Digitale Unterstützung im Trauerprozess - Gemeinsames Trauern und Erinnern"
            />
          </div>
          {/* Spalte 2 */}
          <div className="flex flex-col gap-5 md:gap-6 lg:gap-[2.5rem] min-w-[20rem] max-w-[22.875rem] flex-1">
            <SoWhatNumberBox number="2" text="Bringt Menschen zusammen und stärkt das Gemeinschaftsgefühl" />
            <PrimaryCard
              icon="condolence"
              headline="Beileid online ausdrücken"
              description="Online Gedenkseiten schaffen eine Möglichkeit zur Teilhabe, auch wenn Menschen in Möglichkeiten zur Präsenz eingeschränkt sind. Somit können Sie ihr Beileid online ausdrücken und auch Geschichten von anderen konsumieren, was sonst nicht möglich ist."
              image="/images/feed-gedenkseite.png"
              imageAlt="Digitales Kondolenzbuch und Beileidsbekundungen auf der Gedenkseite"
            />
            <PrimaryCard
              icon="connect"
              headline="Verbindet miteinander"
              description="In der heutigen Zeit leben wir oft an verschiedenen Orten, sind räumlich getrennt und über soziale Netzwerke verbunden. Wir bringen die Menschen in schwierigen Zeiten zusammen – z. B. mit einem digitalen Kondolenzbuch."
              image="/images/kondolenzbuch-gedenkseite.png"
              imageAlt="Digitale Verbindung und Gemeinschaft durch Gedenkseiten - Virtuelles Beisammensein in der Trauer"
            />
          </div>
          {/* Spalte 3 */}
          <div className="flex flex-col gap-5 md:gap-6 lg:gap-[2.5rem] min-w-[20rem] max-w-[22.875rem] flex-1">
            <SoWhatNumberBox number="3" text="Schafft eine zeitgemäße, leicht zugängliche Erinnerung" />
            <PrimaryCard
              icon="media"
              headline="Multimediale Inhalte erwecken deine Gedenkseite zum Leben"
              description="Sowohl Seitenerstellende als auch Gedenkende haben viele Möglichkeiten Seiten zum Leben zu erwecken."
              image="/images/erinnerung-gedenkseite.png"
              imageAlt="Multimediale Erinnerungen auf der digitalen Gedenkseite - Fotos, Videos und persönliche Geschichten"
            />
            <PrimaryCard
              icon="modern"
              headline="Ein zeitgemäßes Gesamtbild"
              description="Die Gedenkseiten für Verstorbene sollen über die jeweiligen Inhalte der Gedenkenden zum Leben erweckt werden. Deshalb setzen wir bewusst auf ein schlichtes Design – Geschmäcker sind verschieden."
              image="/images/gedenkseite-vorschau.png"
              imageAlt="Moderne und würdevoll gestaltete digitale Gedenkseite - Individuelles Design für persönliche Erinnerungen"
            />
          </div>
        </div>
        <div className="w-[22.5rem] pt-[3.75rem] flex justify-center items-center">
          <Button size="m">Jetzt starten</Button>
        </div>
      </div>
    </section>
  );
};

export default SoWhatSection; 