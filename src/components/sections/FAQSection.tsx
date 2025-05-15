import React from 'react';
import FAQAccordion from '@/components/ui/FAQAccordion';

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: 'Was ist eine Gedenkseite?',
      answer: 'Eine Gedenkseite ist ein digitaler Ort, an dem Sie die Erinnerung an einen verstorbenen Menschen bewahren können. Sie können Fotos, Videos, Texte und Erinnerungen teilen und so ein würdevolles Andenken schaffen.'
    },
    {
      question: 'Wie erstelle ich eine Gedenkseite?',
      answer: 'Die Erstellung einer Gedenkseite ist einfach. Klicken Sie auf "Jetzt starten" und folgen Sie den Schritten. Sie können die Seite nach Ihren Wünschen gestalten und mit Inhalten füllen.'
    },
    {
      question: 'Kann ich die Gedenkseite später bearbeiten?',
      answer: 'Ja, Sie können Ihre Gedenkseite jederzeit bearbeiten. Fügen Sie neue Inhalte hinzu, aktualisieren Sie bestehende Einträge oder passen Sie das Design an.'
    },
    {
      question: 'Wie lange bleibt die Gedenkseite online?',
      answer: 'Die Gedenkseite bleibt so lange online, wie Sie es wünschen. Sie können die Dauer selbst festlegen und die Seite jederzeit verlängern oder löschen.'
    },
    {
      question: 'Können andere Personen die Gedenkseite sehen?',
      answer: 'Sie entscheiden, wer Zugriff auf die Gedenkseite hat. Sie können sie öffentlich machen oder nur für ausgewählte Personen zugänglich sein lassen.'
    }
  ];

  return (
    <section className="w-full flex flex-col gap-5 py-6 bg-background-bw px-5 md:px-8 lg:px-[3.75rem]">
      <div className="flex flex-col gap-4 py-6">
        <p className="font-inter font-medium text-[16px] leading-[150%] tracking-[3%] uppercase">
          Häufig gestellte Fragen
        </p>
        <h2 className="text-4xl font-medium text-left">
          Alles was Sie wissen müssen
        </h2>
      </div>
      <div className="w-full max-w-[685px] mx-auto">
        <FAQAccordion items={faqs} />
      </div>
    </section>
  );
};

export default FAQSection; 