'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { TextInput } from '@/components/ui/text-input'
import Checkbox from '@/components/ui/Checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Mail } from 'lucide-react'
import { HeroSection } from '@/components/sections/HeroSection'

const HERO_BACKGROUND = '/images/blur-beta-nutzer.webp'

const benefits = [
  {
    icon: '👑',
    title: 'Kostenlose Premium Mitgliedschaft',
    subtitle: 'Unbezahlbar.',
  },
  {
    icon: '⚡️',
    title: 'Früher Zugang zu neuen Funktionen',
    subtitle: 'Exklusiv.',
  },
  {
    icon: '❤︎',
    title: 'Deine Stimme zählt wirklich',
    subtitle: 'Bedeutungsvoll.',
  },
]

const timeline = [
  {
    title: 'Anfang Januar 2026 – Einführung und erste Schritte',
    items: ['Beta-Gruppen Kennenlernen', 'Persönliches Gespräch (30 Minuten)'],
  },
  {
    title: 'Mitte Januar 2026 – Aktive Testing-Phase',
    items: [
      'Account-Setup',
      'Erste Gedenkseite',
      'Selbstständiges Erkunden der Plattform',
      'Feedback-Runden',
    ],
  },
  {
    title: 'Februar 2026 – Feinschliff und Launch-Vorbereitungen',
    items: ['Feature-Tests', 'Priorisierung & Umsetzung deiner Wünsche', 'Abschluss-Feedback'],
  },
]

const faqs = [
  {
    id: 'beta-q1',
    question: '1. Muss ich technisch versiert sein?',
    answer:
      'Nein, jeder der Lust hat die Plattform zu testen ist herzlich eingeladen. Unterschiedliche Perspektiven helfen uns, eine zugängliche und wertvolle Erfahrung zu gestalten.',
  },
  {
    id: 'beta-q2',
    question: '2. Wie viel Zeit muss ich wirklich investieren?',
    answer:
      'Plane etwa 30 Minuten für das Kennenlernen ein. Danach entscheidest du selbst, wie viel Zeit du in das Erstellen einer oder mehrerer Gedenkseiten und dein Feedback stecken möchtest.',
  },
  {
    id: 'beta-q3',
    question: '3. Kann ich jederzeit die Beta-Phase beenden?',
    answer: 'Selbstverständlich. Du kannst die Teilnahme jederzeit ohne Angabe von Gründen beenden.',
  },
]

export default function BetaNutzerPage() {
  return (
    <div className="relative overflow-hidden bg-primary text-primary">
      <div className="absolute inset-0 -z-10 opacity-70">
        <Image
          src={HERO_BACKGROUND}
          alt="Verlaufshintergrund"
          fill
          priority
          className="object-cover object-center mix-blend-screen"
        />
      </div>

      <main className="relative z-10 flex flex-col gap-24">
        <HeroSection
          title="Gestalte die Zukunft des digitalen Gedenkens mit"
          description="Werde Teil einer kleinen Gruppe, die ein Produkt formt, das Menschen in ihrer Trauer begleitet und unabhängig vom Ort zusammenbringt. Deine Perspektive macht den Unterschied."
          tag={{
            text: 'Limitierte Plätze verfügbar',
            color: 'red',
          }}
          badge={{
            text: 'Entdecke die neuen Gedenkseiten als erstes – Werde Beta-Nutzer',
          }}
          primaryButton={{
            text: 'Ich möchte mitgestalten',
            variant: 'secondary',
          }}
          secondaryAction={{
            text: 'Was erwartet mich?',
            href: '#beta-ablauf',
            type: 'link',
          }}
          shareButton={{
            text: 'Seite teilen',
            onClick: () => {
              if (navigator.share) {
                navigator.share({
                  title: 'Beta-Nutzer werden - Gedenkseiten.ai',
                  url: window.location.href,
                });
              }
            },
          }}
          backgroundImage={{
            src: '/images/blur-beta-nutzer.webp',
            alt: 'Hero Background',
            blendMode: 'plus-lighter',
          }}
        />
        <BenefitsSection />
        <TimelineSection />
        <FaqSection />
      </main>
    </div>
  )
}


function BenefitsSection() {
  return (
    <section className="px-4 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 rounded-md bg-bw-opacity-80 px-6 py-12 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-bw-opacity-60 px-3 py-1 text-body-s-semibold text-secondary">
            Wir nehmen Anmeldungen bis Ende des Jahres entgegen*
          </span>
          <h2 className="max-w-3xl font-satoshi text-desktop-section text-primary">
            Wir suchen <span className="text-accent-blue">20</span> mitgestaltende Menschen für eine
            bedeutungsvolle Sache.
          </h2>
          <p className="max-w-2xl text-desktop-body-l text-secondary">
            Deine Unterstützung ist wertvoll für uns und für andere, deshalb bieten wir dir auch etwas
            Besonderes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-md border border-card bg-bw-opacity-60 p-8 backdrop-blur-md"
            >
              <div className="text-5xl">{benefit.icon}</div>
              <h3 className="mt-6 text-desktop-subsection text-primary">{benefit.title}</h3>
              <p className="mt-2 text-desktop-body-s text-interactive-info">{benefit.subtitle}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function TimelineSection() {
  return (
    <section
      id="beta-ablauf"
      className="px-4 sm:px-10 lg:px-16"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 rounded-md bg-bw-opacity-60 px-6 py-12 backdrop-blur-lg lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <span className="text-tag text-accent">Das erwartet dich konkret</span>
            <h2 className="text-desktop-subsection text-primary">Volle Transparenz: So läuft unsere Beta-Phase ab</h2>
            <p className="text-desktop-body-l text-primary">
              Du bist Teil der Beta-Gruppe und erhältst einen frühen Zugang zum Entwicklungsstand. Deine
              Beobachtungen und Vorschläge fließen direkt in unsere Roadmap. Deine Produktwünsche haben in dieser
              Phase besonderes Gewicht.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-desktop-title-body text-primary">Deine Beta-Reise:</h3>
            <div className="space-y-6">
              {timeline.map((phase) => (
                <div key={phase.title} className="border-t border-hover pt-4">
                  <p className="text-desktop-body-m font-semibold text-primary">{phase.title}</p>
                  <ul className="mt-3 space-y-2 text-desktop-body-s text-primary">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-lg text-accent-blue">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="w-full max-w-md rounded-sm border border-card bg-bw p-6 shadow-md">
          <h3 className="text-desktop-title-body text-primary">Anmeldung zur Beta-Phase</h3>
          <form className="mt-6 space-y-5">
            <TextInput id="beta-name" label="Name" placeholder="z. B. Hannelore Maier" />
            <TextInput
              id="beta-email"
              label="E-Mail"
              placeholder="z. B. jochen123@mail.com"
              type="email"
            />
            <Checkbox
              id="beta-privacy"
              name="privacy"
              label={
                <>
                  Ich stimme den{' '}
                  <Link href="/datenschutz" className="text-link-default hover:underline">
                    Datenschutzbestimmungen
                  </Link>{' '}
                  zu.
                </>
              }
            />
            <Button type="submit" className="w-full">
              Platz reservieren
            </Button>
          </form>
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-main pt-4 text-desktop-body-xs text-secondary">
            <span className="flex items-center gap-2">
              <span role="img" aria-hidden>
                🔒
              </span>
              DSGVO
            </span>
            <span className="flex items-center gap-2">
              <span role="img" aria-hidden>
                🇩🇪
              </span>
              Entwickelt in Berlin
            </span>
            <span className="flex items-center gap-2">
              <span role="img" aria-hidden>
                ❤︎
              </span>
              Mit Hingabe
            </span>
          </div>
        </aside>
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section id="faq" className="w-full px-5 md:px-8 lg:px-[3.75rem] py-16 mt-10 bg-secondary">
      <div className="container mx-auto">
        <div className="max-w-[685px] mx-auto">
          <h2 
            className="mb-8 md:mb-12 text-center text-desktop-section text-primary" 
            style={{ 
              fontFamily: 'Inter',
              letterSpacing: '-0.01em'
            }}
          >
            Noch Fragen?
          </h2>
          
          {/* Inhaltsverzeichnis */}
          <nav className="bg-primary rounded-lg p-6 mb-12">
            <ul className="space-y-2">
              {faqs.map((item) => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    className="text-body-m text-link-default hover:text-link-hover transition-colors"
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
          {faqs.map((item) => (
            <Accordion key={item.id} type="single" collapsible className="mb-4">
              <AccordionItem 
                value={item.id}
                className="rounded-lg bg-primary hover:bg-bw"
                id={item.id}
              >
                <AccordionTrigger 
                  className="p-4 text-primary hover:text-bw hover:no-underline"
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent 
                  className="p-4 text-body-m text-secondary"
                >
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}

          <div className="mt-16 flex flex-col items-center gap-4">
            <p className="text-body-m text-primary mb-8 px-2 text-center">
              Wenn du noch weitere Fragen hast, melde dich gern bei uns.
            </p>
            <Button
              variant="tertiary"
              size="md"
              leftIcon={<Mail className="h-5 w-5" />}
              className="border border-card-inverted text-primary"
            >
              Frage uns
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

