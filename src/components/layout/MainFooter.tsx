import { Footer } from "@/components/ui/footer"
import Image from "next/image";

export function MainFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <Footer
      logo={
        <Image
          src="/images/logo-gedenkseiten.ai-white-x4.png"
          alt="Gedenkseiten.ai Logo"
          width={32}
          height={32}
          priority
        />
        
      }
      brandName="Gedenkseiten.ai"
      socialLinks={[
        
      ]}
      mainLinks={[
        {
          href: "/",
          label: "Startseite",
        },
        {
          href: "#so-what",
          label: "Vorteile",
        },
        {
          href: "#preview",
          label: "Gedenkseiten-Arten",
        },
        {
          href: "#ai-unterstuetzung",
          label: "KI-Unterstützung",
        },
        {
            href: "mailto:hello@gedenkseiten.ai",
            label: "Kontakt",
          },
      ]}
      legalLinks={[
        {
          href: "/datenschutz",
          label: "Datenschutz",
        },
        {
          href: "/impressum",
          label: "Impressum",
        },
      ]}
      copyright={{
        text: `© ${currentYear} Gedenkseiten.ai - Alle Rechte vorbehalten`,
        license: "Mit Respekt und Würde gestaltet",
      }}
    />
  )
} 