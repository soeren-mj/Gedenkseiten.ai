export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Was ist eine Gedenkseite?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Eine Gedenkseite ist ein digitaler Ort, an dem Sie die Erinnerung an einen verstorbenen Menschen bewahren können. Sie können Fotos, Videos, Texte und Erinnerungen teilen und so ein würdevolles Andenken schaffen."
      }
    },
    {
      "@type": "Question",
      "name": "Wie erstelle ich eine Gedenkseite?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Die Erstellung einer Gedenkseite ist einfach. Klicken Sie auf 'Jetzt starten' und folgen Sie den Schritten. Sie können die Seite nach Ihren Wünschen gestalten und mit Inhalten füllen."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich die Gedenkseite später bearbeiten?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, Sie können Ihre Gedenkseite jederzeit bearbeiten. Fügen Sie neue Inhalte hinzu, aktualisieren Sie bestehende Einträge oder passen Sie das Design an."
      }
    },
    {
      "@type": "Question",
      "name": "Wie lange bleibt die Gedenkseite online?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Die Gedenkseite bleibt so lange online, wie Sie es wünschen. Sie können die Dauer selbst festlegen und die Seite jederzeit verlängern oder löschen."
      }
    },
    {
      "@type": "Question",
      "name": "Können andere Personen die Gedenkseite sehen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sie entscheiden, wer Zugriff auf die Gedenkseite hat. Sie können sie öffentlich machen oder nur für ausgewählte Personen zugänglich sein lassen."
      }
    }
  ]
};

export const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://gedenkseiten.ai"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Inhalte",
      "item": "https://gedenkseiten.ai#so-what"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Vorschau",
      "item": "https://gedenkseiten.ai#preview"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "So Funktioniert's",
      "item": "https://gedenkseiten.ai#create"
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "FAQ",
      "item": "https://gedenkseiten.ai#faq"
    }
  ]
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Gedenkseiten.ai",
  "url": "https://gedenkseiten.ai",
  "logo": "https://gedenkseiten.ai/images/logo-gedenkseiten.ai-white-x4.png",
  "description": "Gedenkseiten.ai ist eine innovative Plattform, die künstliche Intelligenz nutzt, um personalisierte und würdevoll gestaltete Gedenkseiten zu erstellen. Wir kombinieren moderne Technologie mit einem sensiblen Umgang mit dem Thema Trauer und Erinnerung.",
  "sameAs": [
    "https://www.facebook.com/gedenkseiten.ai",
    "https://www.instagram.com/gedenkseiten.ai",
    "https://www.linkedin.com/company/gedenkseiten.ai"
  ]
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Gedenkseiten.ai",
  "url": "https://gedenkseiten.ai",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gedenkseiten.ai/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Gedenkseiten.ai",
  "image": "https://gedenkseiten.ai/images/logo-gedenkseiten.ai-white-x4.png",
  "description": "Digitale Gedenkseiten für würdevolles Erinnern",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "DE"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["German", "English"]
  }
};

export const webpageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Gedenkseiten.ai - Digitale Erinnerungsstücke",
  "description": "Erstelle eine würdevolle digitale Gedenkseite für deine verstorbenen Liebsten. Egal ob Mensch oder Tier. Einfach, persönlich und online sonlange du willst.",
  "publisher": {
    "@type": "Organization",
    "name": "Gedenkseiten.ai",
    "logo": {
      "@type": "ImageObject",
      "url": "https://gedenkseiten.ai/images/logo-gedenkseiten.ai-white-x4.png"
    }
  },
  "mainEntity": {
    "@type": "WebPage",
    "name": "Digitale Gedenkseiten erstellen",
    "description": "Moderne und würdevoll gestaltete digitale Gedenkseiten für Ihre verstorbenen Liebsten."
  }
}; 