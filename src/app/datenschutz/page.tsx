import React from "react";

export default function DatenschutzPage() {
  return (
    <section className="w-full flex flex-col gap-10 py-10 px-5 md:px-8 lg:px-[3.75rem] max-w-3xl mx-auto text-[var(--foreground-primary,#F0F0F2)]">
      <h1 className="text-4xl font-medium mb-2">Datenschutz</h1>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="mb-1">1. Verantwortlicher</h2>
          <address className="not-italic whitespace-pre-line text-foreground-secondary">
            Sören Schönnagel<br />
            Palisadenstraße 47<br />
            10243 Berlin, Deutschland<br />
            <span className="text-foreground-secondary">E-Mail: <a href="mailto:hello@gedenkseiten.ai" className="underline">hello@gedenkseiten.ai</a></span>
          </address>
        </div>
        <div>
          <h2 className="mb-1">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
          <h3 className="mt-2 mb-1">2.1 Warteliste</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Welche Daten erheben wir?<br />
            E-Mail-Adresse (Pflichtfeld)<br />
            Name (Pflichtfeld)<br />
            Warum verarbeiten wir diese Daten? Die Datenverarbeitung erfolgt zum Zweck der Verwaltung unserer Warteliste für das geplante Angebot &quot;Gedenkseiten.ai&quot;. Sie werden informiert, sobald der Service verfügbar ist.<br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)<br />
            Speicherdauer: Ihre Daten werden 24 Monate nach der Anmeldung gelöscht, es sei denn, Sie widerrufen Ihre Einwilligung früher oder wir informieren Sie über den Start des Services.<br />
            Double-Opt-In-Verfahren: Nach Ihrer Anmeldung erhalten Sie eine E-Mail mit einem Bestätigungslink. Erst nach Klick auf diesen Link wird Ihre Anmeldung wirksam.
          </div>
          <h3 className="mt-4 mb-1">2.2 Abmeldung von der Warteliste</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Name (Pflichtfeld)<br />
            Warum verarbeiten wir diese Daten? Die Datenverarbeitung erfolgt zum Zweck der Verwaltung unserer Warteliste für das geplante Angebot &quot;Gedenkseiten.ai&quot;. Sie werden informiert, sobald der Service verfügbar ist.<br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)<br />
            Speicherdauer: Ihre Daten werden 24 Monate nach der Anmeldung gelöscht, es sei denn, Sie widerrufen Ihre Einwilligung früher oder wir informieren Sie über den Start des Services.<br />
            Double-Opt-In-Verfahren: Nach Ihrer Anmeldung erhalten Sie eine E-Mail mit einem Bestätigungslink. Erst nach Klick auf diesen Link wird Ihre Anmeldung wirksam.
          </div>
          <h3 className="mt-4 mb-1">2.3 Abmeldung von der Warteliste</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Sie können sich jederzeit von der Warteliste abmelden durch:<br />
            Klick auf den Abmeldelink in jeder E-Mail<br />
            E-Mail an: <a href="mailto:hello@gedenkseiten.ai" className="underline">hello@gedenkseiten.ai</a><br />
            Bei Abmeldung werden Ihre Daten unverzüglich gelöscht.
          </div>
        </div>
        <div>
          <h2 className="mb-1">3. Hosting und technische Dienstleister</h2>
          <h3 className="mt-2 mb-1">3.1 Vercel Inc.</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Unsere Website wird bei Vercel Inc. gehostet:<br />
            Anbieter: Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
            Datenverarbeitung: Beim Besuch unserer Website werden automatisch Informationen in Server-Logfiles gespeichert:<br />
            - IP-Adresse<br />
            - Datum und Uhrzeit des Zugriffs<br />
            - Übertragene Datenmenge<br />
            - Browser-Informationen<br />
            - Referrer-URL<br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an technisch fehlerfreier Darstellung der Website)<br />
            Datenschutz: Vercel ist Privacy Shield zertifiziert und hat Standardvertragsklauseln abgeschlossen.
          </div>
          <h3 className="mt-4 mb-1">3.2 Google Fonts</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Wir nutzen Google Fonts zur Darstellung von Schriftarten:<br />
            Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland<br />
            Datenübertragung: Beim Aufruf werden Schriftarten von Google-Servern geladen. Dabei wird Ihre IP-Adresse übertragen.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einheitlicher Darstellung)<br />
            Datenschutz: <a href="https://policies.google.com/privacy" className="underline">https://policies.google.com/privacy</a>
          </div>
        </div>
        <div>
          <h2 className="mb-1">4. Analyse Tools</h2>
          <h3 className="mt-2 mb-1">4.1 Google Analytics</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Wir verwenden Google Analytics zur Analyse der Website-Nutzung:<br />
            Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland<br />
            Funktionsweise: Google Analytics verwendet Cookies zur Analyse des Nutzungsverhaltens. Die durch Cookies erzeugten Informationen werden in der Regel an Google-Server übertragen.
            IP-Anonymisierung: Wir haben die IP-Anonymisierung aktiviert, wodurch Ihre IP-Adresse innerhalb der EU/EWR gekürzt wird.<br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung über Cookie-Banner)<br />
            Widerspruch: Sie können der Analyse widersprechen durch:<br />
            - Browser-Add-on: <a href="https://tools.google.com/dlpage/gaoptout" className="underline">https://tools.google.com/dlpage/gaoptout</a><br />
            - Cookie-Einstellungen auf unserer Website anpassen<br />
            Datenschutz: <a href="https://policies.google.com/privacy" className="underline">https://policies.google.com/privacy</a>
          </div>
          <h3 className="mt-4 mb-1">4.2 Google Search Console</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Zur Optimierung unserer Website nutzen wir Google Search Console:<br />
            Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland<br />
            Datenverarbeitung: Analyse der Suchmaschinenoptimierung und Webseitenleistung<br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Webseitenoptimierung)<br />
          </div>
          <h3 className="mt-4 mb-1">4.3 Google Tag Manager</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Wir verwenden Google Tag Manager zur Verwaltung von Website-Tags:<br />
            Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland<br />
            Funktionsweise: Der Tag Manager selbst setzt keine Cookies und sammelt keine personenbezogenen Daten. Er verwaltet lediglich andere Tools.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an effizienter Tag-Verwaltung)
          </div>
        </div>
        <div>
          <h2 className="mb-1">5. Cookies</h2>
          <h3 className="mt-2 mb-1">5.1 Technisch notwendige Cookies</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Wir setzen technisch notwendige Cookies ein für:<br />
            - Funktionsfähigkeit der Website<br />
            - Speicherung Ihrer Cookie-Einstellungen<br />
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am technischen Betrieb)
          </div>
          <h3 className="mt-4 mb-1">5.2 Analyse-Cookies</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Analyse-Cookies werden nur mit Ihrer Einwilligung gesetzt. Sie können Ihre Einwilligung jederzeit in den Cookie-Einstellungen widerrufen.
          </div>
          <h3 className="mt-4 mb-1">5.3 Cookie-Verwaltung</h3>
          <div className="text-foreground-secondary whitespace-pre-line">
            Browser-Einstellungen: Sie können Cookies in Ihren Browser-Einstellungen blockieren oder löschen.<br />
            Cookie-Banner: Bei Ihrem ersten Besuch können Sie über unseren Cookie-Banner wählen, welche Cookies Sie akzeptieren möchten.
          </div>
        </div>
        <div>
          <h2 className="mb-1">6. Ihre Rechte</h2>
          <div className="text-foreground-secondary whitespace-pre-line">
            Nach der DSGVO haben Sie folgende Rechte:<br />
            - Auskunft (Art. 15 DSGVO): Information über verarbeitete Daten<br />
            - Berichtigung (Art. 16 DSGVO): Korrektur unrichtiger Daten<br />
            - Löschung (Art. 17 DSGVO): Löschung Ihrer Daten<br />
            - Einschränkung (Art. 18 DSGVO): Einschränkung der Verarbeitung<br />
            - Datenübertragbarkeit (Art. 20 DSGVO): Herausgabe Ihrer Daten<br />
            - Widerspruch (Art. 21 DSGVO): Widerspruch gegen die Verarbeitung
            - Widerruf (Art. 7 DSGVO): Widerruf erteilter Einwilligungen<br />
            Kontakt: <a href="mailto:hello@gedenkseiten.ai" className="underline">hello@gedenkseiten.ai</a>
            Beschwerde: Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren.
          </div>
        </div>
        <div>
          <h2 className="mb-1">7. Datensicherheit</h2>
          <div className="text-foreground-secondary whitespace-pre-line">
             Wir treffen technische und organisatorische Maßnahmen zum Schutz Ihrer Daten:<br />
            - SSL/TLS-Verschlüsselung der Website<br />
            - Sichere Server-Infrastruktur<br />
            - Regelmäßige Sicherheitsupdates<br />
            - Zugriffskontrollen
          </div>
        </div>
        <div>
          <h2 className="mb-1">8. Internationale Datenübertragung</h2>
          <div className="text-base text-[var(--foreground-secondary,#C0C1CC)] whitespace-pre-line">
            Bei der Nutzung von Google-Services werden Daten in die USA übertragen. Google ist nach dem EU-US Data Privacy Framework zertifiziert und hat Standardvertragsklauseln abgeschlossen.
          </div>
        </div>
        <div>
          <h2 className="mb-1">9. Änderungen der Datenschutzerklärung</h2>
          <div className="text-base text-[var(--foreground-secondary,#C0C1CC)] whitespace-pre-line">
            Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren. Die aktuelle Version finden Sie stets auf dieser Seite.
          </div>
          <div className="text-foreground-secondary mt-2">
            Stand: 22.05.2025
          </div>
        </div>
      </div>
    </section>
  );
} 