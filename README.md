# Gedenkseiten.ai

Eine moderne Plattform für digitale Gedenkseiten, entwickelt mit Next.js 14, Supabase und Tailwind CSS.

## Funktionen

- 🎨 Modernes, responsives Design
- 🔒 Sichere Authentifizierung mit Supabase
- 📧 E-Mail-Bestätigung mit Resend
- 📊 Analytics mit Google Analytics 4
- 🔍 SEO-optimiert
- 🌐 DSGVO-konform mit Cookie-Banner
- 🚀 Optimierte Performance

## Technologie-Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Resend für E-Mails
- Google Analytics 4

## Erste Schritte

1. Repository klonen:
```bash
git clone https://github.com/yourusername/gedenkseiten-ai.git
cd gedenkseiten-ai
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Umgebungsvariablen konfigurieren:
Erstellen Sie eine `.env.local` Datei im Wurzelverzeichnis und fügen Sie die folgenden Variablen hinzu:

```env
# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://suskrmvlyaryiqajcuic.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1c2tybXZseWFyeWlxYWpjdWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMzUyNTAsImV4cCI6MjA2MTkxMTI1MH0.vFEkOPSvoHzjc_7B4XWS17AF7_MRT7kIpubIkZUbzoc

# Email (Resend)
RESEND_API_KEY=re_YZeesR6E_CrRVbyusQxvdHkTcrPb7ADqM

# Analytics
NEXT_PUBLIC_GA_ID=G-3SLHC0N8P1

# Optional: Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

4. Entwicklungsserver starten:
```bash
npm run dev
```

Die Anwendung ist nun unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Deployment

Die Anwendung ist für das Deployment auf Vercel optimiert. Folgen Sie diesen Schritten:

1. Pushen Sie Ihren Code zu GitHub
2. Verbinden Sie das Repository mit Vercel
3. Konfigurieren Sie die Umgebungsvariablen in Vercel
4. Deployen Sie die Anwendung

## Beitragen

Wir freuen uns über Beiträge! Bitte lesen Sie unsere Beitragsrichtlinien, bevor Sie einen Pull Request erstellen.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
