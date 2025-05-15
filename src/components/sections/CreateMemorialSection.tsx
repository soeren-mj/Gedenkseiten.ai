import React from 'react';
import SmallCard from '@/components/cards/SmallCard';

const CreateMemorialSection: React.FC = () => {
  const cards = [
    {
      number: '1',
      headline: 'Daten eingeben',
      description: 'Wir führen Sie durch die wichtigen Punkte, so erstellen Sie in wenigen Schritten die gewünschte Gedenkseite',
      variant: 'dark' as const
    },
    {
      number: '2',
      headline: 'Inhalte hinzufügen',
      description: 'Die Gedenkseiten auf Memorial Journey sind würdevoll und schlicht, denn die Verstorbenen leben durch die Momente die Sie mit Fotos und Videos teilen können.',
      variant: 'dark' as const
    },
    {
      number: '3',
      headline: 'Familie und Freunde einladen',
      description: 'Erlauben Sie Freunden und Familie, virtuelle Kerzen oder Blumen zu platzieren, Termine zu sehen und sich ins Kondulenzbuch einzutragen.',
      variant: 'dark' as const
    },
    {
      number: '4',
      headline: 'In Erinnerung bleiben',
      description: 'Du hast die Möglichkeit Events zu erstellen und Familie und Freunde an Jahrestage o.ä. zu erinnern. So bleibt ein geliebter Mensch erhalten und ein Stück weit lebendig.',
      variant: 'dark' as const
    },
    {
      number: 'X',
      headline: 'Stammbaum verwalten',
      description: 'Wir wollen ein einfache Navigation innerhalb der Familie ermöglichen, so können Sie ihre Familiengeschichte dokumentieren und jederzeit einsehen.',
      variant: 'light' as const
    }
  ];

  return (
    <section className="w-full flex flex-col items-center gap-5 py-6 bg-background-bw px-5 md:px-8 lg:px-[3.75rem]">
      <div className="w-full max-w-[1820px] flex flex-col gap-4 py-6 pl-4">
        <p className="font-inter font-medium text-[16px] leading-[150%] tracking-[3%] uppercase">
          .ai unterstützt dich bei der Erstellung
        </p>
        <h2 className="text-4xl font-medium text-left">
          In zwei Schritten zur digitalen Gedenkseite
        </h2>
      </div>
      <div className="w-full flex flex-wrap gap-5 justify-center">
        {cards.map((card, index) => (
          <div key={index} className="min-w-[224px] max-w-[320px] flex-1 basis-[200px]">
            <SmallCard
              number={card.number}
              headline={card.headline}
              description={card.description}
              variant={card.variant}
              isLast={index === cards.length - 1}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CreateMemorialSection; 