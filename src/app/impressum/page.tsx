import React from "react";

export default function ImpressumPage() {
  return (
    <section className="w-full flex flex-col gap-10 pt-40 pb-12 px-5 md:px-8 lg:px-[3.75rem] max-w-3xl mx-auto text-[var(--foreground-primary,#F0F0F2)]">
      <h1 className="mb-2">Impressum</h1>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="mb-1">Angaben gemäß § 5 TMG:</h2>
          <address className="not-italic whitespace-pre-line text-foreground-secondary">
            Sören Schönnagel<br />
            Palisadenstraße 47<br />
            10243 Berlin<br />
            Deutschland
          </address>
          <div className="mt-2">
            <h4>Kontakt:</h4>
            <span className="text-foreground-secondary">E-Mail: <a href="mailto:hello@gedenkseiten.ai" className="underline">hello@gedenkseiten.ai</a></span>
          </div>
        </div>
        <hr className="border-t border-[var(--foreground-primary,#F0F0F2)] opacity-30" />
        <div className="flex flex-col gap-4">
          <h3 className="mb-2">Haftungsausschluss</h3>
          <div className="mb-3">
            <h4 className="mb-1">Haftung für Inhalte</h4>
            <p className="text-foreground-secondary">Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
          </div>
          <div className="mb-3">
            <h4 className="mb-1">Haftung für Links</h4>
            <p className="text-foreground-secondary">Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.</p>
          </div>
          <div>
            <h4 className="mb-1">Urheberrecht</h4>
            <p className="text-foreground-secondary">Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
          </div>
        </div>
        <hr className="border-t border-[var(--foreground-primary,#F0F0F2)] opacity-30" />
        <div>
          <p><strong>Hinweis:</strong> Dieses Projekt befindet sich in der Entwicklungsphase. Die Warteliste dient der Interessensbekundung für das geplante Angebot.</p>
        </div>
      </div>
    </section>
  );
} 