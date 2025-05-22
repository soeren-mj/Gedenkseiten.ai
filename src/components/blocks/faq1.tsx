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
        "Eine digitale Gedenkseite ist ein virtueller Ort der Erinnerung, wo Familie und Freunde gemeinsam einem geliebten Menschen, einem treuen Tier oder einer Familie gedenken können. Bei Gedenkseiten.ai schaffen Sie einen würdevollen Online-Raum mit Fotos, Videos, einem Nachruf und einem digitalen Kondolenzbuch, in dem sich alle Menschen eintragen können, die Anteil nehmen möchten.",
    },
    {
      id: "q2",
      question: "2. Welche Informationen und Inhalte gehören auf eine Gedenkseite?",
      answer:
        "Ihre Online-Gedenkseite kann alles enthalten, was das Leben und die Persönlichkeit des Verstorbenen widerspiegelt: einen persönlichen Gedenkspruch (max. 160 Zeichen), einen liebevoll verfassten Nachruf, bedeutsame Fotos und Videos in den Rückblicken, wichtige Termine wie Beerdigung oder Gedenkfeiern sowie ein digitales Kondolenzbuch für Beileidsbekundungen von Familie und Freunden. Es gibt auch einen Raum für Gedenknachrichten die jederzeit genutzt werden können.",
    },
    {
      id: "q3",
      question: "3. Wie erstelle ich eine Gedenkseite?",
      answer:
        "Eine neue Gedenkseite erstellen ist bei Gedenkseiten.ai ganz einfach und feinfühlig gestaltet. Nach der Anmeldung können Sie Schritt für Schritt alle wichtigen Informationen hinzufügen, Fotos und Videos hochladen und andere Angehörige einladen, gemeinsam an der Gestaltung mitzuwirken. Unsere moderne Plattform begleitet Sie dabei behutsam durch jeden Schritt.",
    },
    {
      id: "q4",
      question: "4. Was kostet eine Gedenkseite?",
      answer:
        "Die Kosten für eine digitale Gedenkseite bei Gedenkseiten.ai werden transparent und fair gestaltet sein. Da wir uns noch in der Entwicklungsphase befinden, können Sie sich gerne auf unsere Warteliste eintragen, um als einer der Ersten über unsere Preismodelle informiert zu werden. Unser Ziel ist es, würdevolles Gedenken für jeden zugänglich zu machen. Es wird definitiv kostenfreie Optionen geben.",
    },
    {
      id: "q5",
      question: "5. Welche Arten von Gedenkseiten gibt es?",
      answer:
        "Bei Gedenkseiten.ai können Sie Online-Gedenkseiten für verschiedene Anlässe erstellen: für eine geliebte Person, ein treues Haustier, eine ganze Familie oder auch für tragische Ereignisse, die eine Gemeinschaft bewegt haben. Jede Gedenkseite wird individuell gestaltet und spiegelt die einzigartige Geschichte und Persönlichkeit wider.",
    },
    {
      id: "q6",
      question: "6. Wie kann ich Fotos, Videos oder Musik auf einer Gedenkseite hinzufügen?",
      answer:
        "Das Hinzufügen von Erinnerungen zu Ihrer Gedenkseite online ist intuitiv und respektvoll gestaltet. In den Rückblicken können Sie bedeutsame Fotos und Videos hochladen, die das Leben des Verstorbenen würdigen. Zukünftig werden KI-Funktionen dabei helfen, Ihre Fotos zu verbessern und die schönsten Erinnerungen noch strahlender zu präsentieren.",
    },
    {
      id: "q7",
      question: "7. Wie kann ich die Gedenkseite privat halten oder mit bestimmten Personen teilen?",
      answer:
        "Ihre digitale Gedenkseite kann ganz nach Ihren Wünschen gestaltet werden. Sie entscheiden, wer Zugang hat - ob nur die engste Familie, ein größerer Kreis von Freunden oder eine offene Gedenkgemeinschaft.",
    },
    {
      id: "q8",
      question: "8. Wie lange bleibt eine Gedenkseite online?",
      answer:
        "Eine Online-Gedenkseite bei Gedenkseiten.ai bleibt so lange online, wie Sie als Ersteller es wünschen. Sie haben jederzeit die volle Kontrolle über Ihre Gedenkseite und können selbst entscheiden, ob und wann Sie diese löschen möchten. Die Entscheidung liegt ganz bei Ihnen - schließlich ist es Ihr persönlicher Ort der Erinnerung, den Sie nach Ihren Bedürfnissen gestalten können.",
    },
    {
      id: "q9",
      question: "9. Welche rechtlichen Aspekte muss ich beachten?",
      answer:
        "Beim Gedenkseite erstellen achten wir bei Gedenkseiten.ai auf alle wichtigen rechtlichen Aspekte. Sie sollten sicherstellen, dass Sie die Rechte an hochgeladenen Fotos und Videos besitzen oder die Zustimmung der Rechteinhaber haben. Beim Verfassen des Nachrufs und der Gedenksprüche gelten die üblichen Regeln für respektvolle und wahrheitsgemäße Darstellungen.",
    },
    {
      id: "q10",
      question: "10. Welche Vorteile bietet eine Online-Gedenkseite gegenüber traditionellen Formen des Gedenkens?",
      answer:
        "Eine digitale Gedenkseite verbindet Menschen über Grenzen hinweg und ermöglicht es auch entfernt lebenden Angehörigen, Teil der Trauergemeinschaft zu sein. Anders als traditionelle Formen ist sie jederzeit zugänglich, kann gemeinsam gestaltet werden und wächst durch die Beiträge aller Beteiligten. Bei Gedenkseiten.ai schaffen Sie einen lebendigen Ort der Erinnerung mit Feed-Funktion, digitalem Kondolenzbuch und der Möglichkeit, Termine zu teilen - modern, würdevoll und zeitlos zugleich.",
    },
  ],
}: Faq1Props) => {
  return (
    <section id="faq" className="w-full px-5 md:px-8 lg:px-[3.75rem] py-16 mt-10" style={{ background: '#131316' }}>
      <div className="container mx-auto">
        <div className="max-w-[685px] mx-auto">
          <h2 
            className="mb-8 md:mb-12 text-center" 
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
                  Gedenkseiten.ai ist die modernste Plattform für digitale Gedenkseiten, die es derzeit auf dem Markt gibt. Wir entwickeln eine innovative Online-Lösung, die es Angehörigen ermöglicht, würdevolle und persönliche Gedenkseiten für ihre Liebsten zu erstellen. Mit zukünftigen KI-Funktionen wie intelligenten Text-Ideen und Foto-Verbesserungen machen wir das Gedenkseite erstellen noch einfühlsamer und benutzerfreundlicher. Derzeit sammeln wir über unsere Warteliste Interessenten, um gemeinsam die Zukunft des digitalen Gedenkens zu gestalten.
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
                  Unsere Mission bei Gedenkseiten.ai ist es, Trauer und Erinnerung in der digitalen Welt einen würdevollen Platz zu geben. Wir möchten Angehörigen dabei helfen, auf moderne und herzliche Weise zu gedenken - egal ob es um einen geliebten Menschen, ein treues Haustier oder eine ganze Familie geht. Unser Ziel ist es, die modernste Online-Gedenkseite zu schaffen, die Technologie und Empathie miteinander verbindet. Wir glauben daran, dass Erinnerungen Menschen verbinden und dass digitale Gedenkstätten dabei helfen können, Trauer zu teilen und gemeinsam zu heilen.
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
