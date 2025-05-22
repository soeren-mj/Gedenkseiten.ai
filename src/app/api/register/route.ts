import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import resend from '@/lib/resend';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    // Validate request
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('Invalid JSON in request:', parseError);
      return NextResponse.json(
        { error: 'Ungültiges Anfrage-Format' },
        { status: 400 }
      );
    }

    const { name, email } = requestBody;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name und E-Mail sind erforderlich' },
        { status: 400 }
      );
    }

    // Überprüfe, ob die E-Mail-Adresse bereits existiert
    const { data: existingUser, error: existingUserError } = await supabase
      .from('registrations')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUserError) {
      console.error('Fehler bei der Überprüfung existierender E-Mail:', existingUserError);
    }

    if (existingUser) {
      return NextResponse.json(
        { 
          error: "Diese E-Mail-Adresse existiert bereits. Nimm eine andere E-Mail-Adresse oder schreibe uns eine E-Mail an hello@gedenkseiten.ai, solltest du Hilfe bei der Anmeldung benötigen." 
        },
        { status: 400 }
      );
    }

    // Generiere einen eindeutigen Token für die Bestätigung
    const confirmationToken = nanoid(32);
    
    // Berechne das Ablaufdatum (7 Tage von jetzt)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Hole die Basis-URL aus der Request
    let baseUrl;
    try {
      const url = new URL(request.url);
      const protocol = url.protocol;
      const hostname = url.hostname;
      const port = url.port ? `:${url.port}` : '';
      baseUrl = `${protocol}//${hostname}${port}`;
    } catch {
      // Fallback für Produktionsumgebungen
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'https://gedenkseiten.ai';
    }
    
    console.log('Using baseUrl for confirmation:', baseUrl);
    
    const confirmUrl = `${baseUrl}/confirm?token=${confirmationToken}`;

    console.log('Attempting to insert registration:', {
      name,
      email,
      status: 'pending',
      confirmation_token: confirmationToken,
      token_expires_at: expiresAt.toISOString()
    });

    // Überprüfe zuerst, ob die Tabelle existiert
    await supabase
      .from('registrations')
      .select('id')
      .limit(1);

    // Speichere die Anmeldung in Supabase
    await supabase
      .from('registrations')
      .insert([
        { 
          name, 
          email, 
          status: 'pending',
          confirmation_token: confirmationToken,
          confirmed_at: null,
          token_expires_at: expiresAt.toISOString()
        }
      ]);

    // Sende Bestätigungs-E-Mail mit Resend
    try {
      console.log('Attempting to send email via Resend to:', email);
      
      if (!resend) {
        console.error('Resend ist nicht initialisiert. E-Mail wird nicht gesendet, aber Registrierung bleibt bestehen.');
        
        // Setze den Status auf "email_failed"
        await supabase
          .from('registrations')
          .update({ 
            status: 'email_failed',
            email_error: 'Resend nicht initialisiert' 
          })
          .eq('confirmation_token', confirmationToken);
          
        return NextResponse.json(
          { 
            error: 'Die Anmeldung wurde gespeichert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Der Administrator wurde informiert.',
            registrationSaved: true
          },
          { status: 200 }  // 200 statt 500, da die Registrierung erfolgreich war
        );
      }
      
      // Überprüfe, ob die From-Adresse mit einer verifizierten Domain verwendet wird
      const senderName = 'Sören von Gedenkseiten.ai';
      const senderEmail = 'hello@gedenkseiten.ai';
      const fromEmail = `${senderName} <${senderEmail}>`;
      const domainMatch = fromEmail.match(/<.*?@(.*?)>/);
      const domain = domainMatch ? domainMatch[1] : null;
      
      console.log('Sende E-Mail mit Domain:', domain);
      
      const emailResponse = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Bitte bestätige deine Anmeldung bei Gedenkseiten.ai',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bestätige deine Anmeldung</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            
            .email-header {
              background-color: #475EEC;
              color: white;
              padding: 24px;
              text-align: center;
            }
            
            .email-header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            
            .email-content {
              padding: 32px 24px;
            }
            
            .greeting {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 16px;
            }
            
            .message {
              margin-bottom: 24px;
              color: #555;
            }
            
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            
            .button {
              display: inline-block;
              background-color: #475EEC;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 500;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              transition: background-color 0.2s;
            }
            
            .button:hover {
              background-color: #3a4cd6;
            }
            
            .note {
              font-size: 14px;
              color: #777;
              margin-top: 24px;
            }
            
            .email-footer {
              background-color: #f8f8f8;
              padding: 16px 24px;
              text-align: center;
              color: #888;
              font-size: 14px;
              border-top: 1px solid #eee;
            }
            
            .footer-links {
              margin-top: 8px;
            }
            
            .footer-links a {
              color: #475EEC;
              text-decoration: none;
              margin: 0 8px;
            }
            
            @media only screen and (max-width: 480px) {
              .email-container {
                width: 100% !important;
                border-radius: 0 !important;
              }
              
              .email-header {
                padding: 16px !important;
              }
              
              .email-content {
                padding: 24px 16px !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Gedenkseiten.ai</h1>
            </div>
            
            <div class="email-content">
              <div class="greeting">Hallo ${name},</div>
              
              <div class="message">
                <p>vielen Dank für deine Anmeldung bei Gedenkseiten.ai.</p>
                <p>Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Button klickst:</p>
              </div>
              
              <div class="button-container">
                <a href="${confirmUrl}" class="button">E-Mail-Adresse bestätigen</a>
              </div>
              
              <div class="note">
                <p>Der Link ist 7 Tage gültig.</p>
                <p>Falls du Probleme hast, kannst du auch diese URL in deinem Browser öffnen:</p>
                <p style="word-break: break-all; font-size: 12px; color: #999;">${confirmUrl}</p>
              </div>
            </div>
            
            <div class="email-footer">
              <p>Mit freundlichen Grüßen,<br>Dein Gedenkseiten.ai Team</p>
              <div class="footer-links">
                <a href="https://gedenkseiten.ai/datenschutz">Datenschutz</a>
                <a href="https://gedenkseiten.ai/kontakt">Kontakt</a>
              </div>
            </div>
          </div>
        </body>
        </html>
        `
      });
      
      console.log('Email sent successfully with Resend:', emailResponse);
    } catch (emailError) {
      console.error('Resend error details:', emailError);
      
      // Speichere den Fehler in der Datenbank
      await supabase
        .from('registrations')
        .update({ 
          email_error: typeof emailError === 'object' ? 
            JSON.stringify(emailError, Object.getOwnPropertyNames(emailError)) : 
            String(emailError) 
        })
        .eq('confirmation_token', confirmationToken);

      return NextResponse.json(
        { 
          error: 'Die Anmeldung wurde gespeichert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte kontaktieren Sie den Administrator.',
          registrationSaved: true
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Bitte überprüfe deine E-Mails für die Bestätigung.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
} 