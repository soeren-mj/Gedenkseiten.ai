import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
  id: string;
}

interface Faq1Props {
  heading?: string;
  items?: FaqItem[];
}

const Faq1 = ({
  heading = "Die 10 wichtigsten Fragen zu Gedenkseiten: Alles, was Sie wissen müssen",
  items = [
    {
      id: "q1",
      question: "1. Was ist eine Gedenkseite?",
      answer:
        "Eine Gedenkseite ist eine digitale Plattform, die es Ihnen ermöglicht, eine persönliche Erinnerungsstätte für Ihre verstorbenen Angehörigen zu erstellen. Sie können Erinnerungen teilen, Fotos hochladen und eine virtuelle Gedenkstätte gestalten, die von überall aus zugänglich ist.",
    },
    {
      id: "q2",
      question: "2. Welche Informationen und Inhalte gehören auf eine Gedenkseite?",
      answer:
        "Auf einer Gedenkseite können Sie verschiedene Inhalte teilen: Biografische Informationen, Fotos und Videos, persönliche Geschichten und Erinnerungen, Trauerreden oder Gedichte, Informationen zu Beerdigung und Trauerfeier, sowie ein digitales Kondolenzbuch für Beileidsbekundungen.",
    },
    {
      id: "q3",
      question: "3. Wie erstelle ich eine Gedenkseite?",
      answer:
        "Um eine Gedenkseite zu erstellen, registrieren Sie sich zunächst auf unserer Plattform. Anschließend können Sie eine neue Gedenkseite anlegen und diese mit persönlichen Informationen, Fotos und Erinnerungen gestalten. Unser intuitives System führt Sie durch den gesamten Prozess.",
    },
    {
      id: "q4",
      question: "4. Was kostet eine Gedenkseite?",
      answer:
        "Die Erstellung einer Gedenkseite ist kostenlos. Wir bieten verschiedene Pakete an, die zusätzliche Funktionen und Speicherplatz beinhalten. Die genauen Preise finden Sie in unserem Preisvergleich.",
    },
    {
      id: "q5",
      question: "5. Welche Arten von Gedenkseiten gibt es?",
      answer:
        "Es gibt verschiedene Arten von Gedenkseiten: Private Gedenkseiten für Familie und enge Freunde, öffentliche Gedenkseiten für die breite Öffentlichkeit, temporäre Gedenkseiten für Trauerfeiern, und permanente Gedenkseiten für langfristiges Gedenken.",
    },
    {
      id: "q6",
      question: "6. Wie kann ich Fotos, Videos oder Musik auf einer Gedenkseite hinzufügen?",
      answer:
        "Sie können Medien über unseren einfachen Upload-Bereich hinzufügen. Unterstützt werden gängige Bildformate (JPG, PNG), Videos (MP4) und Audiodateien (MP3). Sie können die Medien auch mit Beschreibungen und Datumsangaben versehen.",
    },
    {
      id: "q7",
      question: "7. Wie kann ich die Gedenkseite privat halten oder mit bestimmten Personen teilen?",
      answer:
        "Sie haben volle Kontrolle über die Privatsphäre Ihrer Gedenkseite. Sie können sie komplett privat halten, nur für eingeladene Personen zugänglich machen oder öffentlich stellen. Die Einstellungen können jederzeit angepasst werden.",
    },
    {
      id: "q8",
      question: "8. Wie lange bleibt eine Gedenkseite online?",
      answer:
        "Ihre Gedenkseite bleibt so lange online, wie Sie es wünschen. Sie können sie jederzeit aktualisieren, archivieren oder löschen. Wir bieten auch die Möglichkeit, die Seite dauerhaft zu erhalten.",
    },
    {
      id: "q9",
      question: "9. Welche rechtlichen Aspekte muss ich beachten?",
      answer:
        "Wichtig ist, dass Sie die Rechte an den hochgeladenen Inhalten besitzen. Bei Fotos und Videos sollten Sie sicherstellen, dass Sie die Erlaubnis zur Veröffentlichung haben. Wir beraten Sie gerne zu allen rechtlichen Fragen.",
    },
    {
      id: "q10",
      question: "10. Welche Vorteile bietet eine Online-Gedenkseite gegenüber traditionellen Formen des Gedenkens?",
      answer:
        "Online-Gedenkseiten bieten zahlreiche Vorteile: Sie sind von überall aus zugänglich, ermöglichen die Teilhabe von Menschen, die nicht vor Ort sein können, bieten mehr Platz für Inhalte als traditionelle Medien, und können kontinuierlich aktualisiert werden.",
    },
  ],
}: Faq1Props) => {
  return (
    <section id="faq" className="w-full px-5 md:px-8 lg:px-[3.75rem] py-16 mt-10" style={{ background: '#131316' }}>
      <div className="container mx-auto">
        <div className="max-w-[685px] mx-auto">
          <h2 
            className="text-[28px] font-medium leading-[130%] text-[#F0F0F2] mb-8 md:mb-12 text-center" 
            style={{ 
              fontFamily: 'Inter',
              letterSpacing: '-0.01em'
            }}
          >
            {heading}
          </h2>
          
          {/* Inhaltsverzeichnis */}
          <nav className="bg-[#2A2B30] rounded-lg p-6 mb-12">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    className="text-[#92A1FC] hover:text-[#F0F0F2] transition-colors"
                    style={{ fontFamily: 'Inter' }}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        // Öffne das Accordion
                        const accordionTrigger = element.querySelector('button[data-state]') as HTMLButtonElement;
                        if (accordionTrigger) {
                          // Warte kurz, bis das Scrollen abgeschlossen ist
                          setTimeout(() => {
                            if (accordionTrigger.getAttribute('data-state') === 'closed') {
                              accordionTrigger.click();
                            }
                          }, 300);
                        }
                      }
                    }}
                  >
                    {item.question}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* FAQ Items */}
          {items.map((item) => (
            <Accordion key={item.id} type="single" collapsible className="mb-4">
              <AccordionItem 
                value={item.id}
                className="border border-[#2A2B30] rounded-lg bg-[#2A2B30]"
                id={item.id}
              >
                <AccordionTrigger 
                  className="px-4 py-3 text-[#F0F0F2] hover:text-[#92A1FC] hover:no-underline"
                  style={{ fontFamily: 'Inter' }}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent 
                  className="px-4 py-3 text-[#C0C1CC]"
                  style={{ fontFamily: 'Inter' }}
                >
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}

          {/* Weitere allgemeine Fragen */}
          <div className="mt-16">
            <p className="text-[#C0C1CC] mb-8 px-2" style={{ fontFamily: 'Inter' }}>
              Neben den wichtigsten Fragen zu Gedenkseiten haben wir hier noch weitere allgemeine Informationen für Sie zusammengestellt.
            </p>
            <h3 
              className="text-[24px] font-medium leading-[140%] text-[#F0F0F2] mb-8 px-2" 
              style={{ 
                fontFamily: 'Inter',
                letterSpacing: '-0.005em'
              }}
            >
              Weitere Fragen zu Gedenkseiten.ai
            </h3>
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem 
                value="general-1"
                className="border border-[#2A2B30] rounded-lg bg-[#2A2B30]"
              >
                <AccordionTrigger 
                  className="px-4 py-3 text-[#F0F0F2] hover:text-[#92A1FC] hover:no-underline"
                  style={{ fontFamily: 'Inter' }}
                >
                  1. Was ist Gedenkseiten.ai?
                </AccordionTrigger>
                <AccordionContent 
                  className="px-4 py-3 text-[#C0C1CC]"
                  style={{ fontFamily: 'Inter' }}
                >
                  Gedenkseiten.ai ist eine innovative Plattform, die künstliche Intelligenz nutzt, um personalisierte und würdevoll gestaltete Gedenkseiten zu erstellen. Wir kombinieren moderne Technologie mit einem sensiblen Umgang mit dem Thema Trauer und Erinnerung.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem 
                value="general-2"
                className="border border-[#2A2B30] rounded-lg bg-[#2A2B30]"
              >
                <AccordionTrigger 
                  className="px-4 py-3 text-[#F0F0F2] hover:text-[#92A1FC] hover:no-underline"
                  style={{ fontFamily: 'Inter' }}
                >
                  2. Was ist das Ziel und die Mission von Gedenkseiten.ai?
                </AccordionTrigger>
                <AccordionContent 
                  className="px-4 py-3 text-[#C0C1CC]"
                  style={{ fontFamily: 'Inter' }}
                >
                  Unsere Mission ist es, Menschen in ihrer Trauer zu unterstützen und ihnen einen modernen, würdevollen Weg zu bieten, ihre Erinnerungen zu bewahren. Wir möchten die Art und Weise, wie wir an unsere verstorbenen Angehörigen denken, in das digitale Zeitalter führen und dabei die menschliche Komponente nie aus den Augen verlieren.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Faq1 };
