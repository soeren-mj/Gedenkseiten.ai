import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing Resend API key');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'EmailError';
  }
}

interface SendConfirmationEmailParams {
  to: string;
  confirmationToken: string;
}

interface SendWelcomeEmailParams {
  to: string;
}

export async function sendConfirmationEmail({ to, confirmationToken }: SendConfirmationEmailParams) {
  try {
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/confirm?token=${confirmationToken}`;

    const { data, error } = await resend.emails.send({
      from: 'Gedenkseiten.ai <no-reply@gedenkseiten.ai>',
      to: [to],
      subject: 'Bestätige deine Anmeldung für die Warteliste | Gedenkseiten.ai',
      html: `
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="${process.env.NEXT_PUBLIC_BASE_URL}/images/logo-gedenkseiten.ai-black-x4.png" alt="Gedenkseiten.ai Logo" style="max-width: 200px; margin-bottom: 20px;">
          
          <h1 style="color: #1F2024; margin-bottom: 20px;">Bestätige deine E-Mail-Adresse</h1>
          
          <p>Vielen Dank für dein Interesse an Gedenkseiten.ai!</p>
          
          <p>Um dich für die Warteliste anzumelden, bestätige bitte deine E-Mail-Adresse durch Klicken auf den folgenden Button:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #E5A417; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">E-Mail-Adresse bestätigen</a>
          </p>
          
          <p>Oder kopiere diesen Link in deinen Browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">
            ${confirmationUrl}
          </p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Falls du dich nicht für die Warteliste von Gedenkseiten.ai angemeldet hast, kannst du diese E-Mail ignorieren.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} Gedenkseiten.ai - Alle Rechte vorbehalten
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      throw new EmailError(error.message);
    }

    return data;
  } catch (error) {
    if (error instanceof EmailError) {
      throw error;
    }
    throw new EmailError('Fehler beim Senden der Bestätigungs-E-Mail');
  }
}

export async function sendWelcomeEmail({ to }: SendWelcomeEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Gedenkseiten.ai <no-reply@gedenkseiten.ai>',
      to: [to],
      subject: 'Willkommen bei Gedenkseiten.ai!',
      html: `
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="${process.env.NEXT_PUBLIC_BASE_URL}/images/logo-gedenkseiten.ai-black-x4.png" alt="Gedenkseiten.ai Logo" style="max-width: 200px; margin-bottom: 20px;">
          
          <h1 style="color: #1F2024; margin-bottom: 20px;">Willkommen bei Gedenkseiten.ai!</h1>
          
          <p>Vielen Dank für die Bestätigung deiner E-Mail-Adresse. Du bist nun erfolgreich auf unserer Warteliste.</p>
          
          <p>Was passiert als Nächstes?</p>
          
          <ul style="padding-left: 20px;">
            <li>Wir informieren dich, sobald Gedenkseiten.ai startet</li>
            <li>Du erhältst als einer der Ersten Zugang zur Plattform</li>
            <li>Wir halten dich über wichtige Entwicklungen auf dem Laufenden</li>
          </ul>
          
          <p>Falls du Fragen hast (oder dich von der Warteliste abmelden möchtest), kannst du uns jederzeit eine E-Mail an <a href="mailto:hello@gedenkseiten.ai">hello@gedenkseiten.ai</a> schreiben.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} Gedenkseiten.ai - Alle Rechte vorbehalten
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      throw new EmailError(error.message);
    }

    return data;
  } catch (error) {
    if (error instanceof EmailError) {
      throw error;
    }
    throw new EmailError('Fehler beim Senden der Willkommens-E-Mail');
  }
} 