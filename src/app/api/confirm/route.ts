import { NextResponse } from 'next/server';
import { supabase, type Registration } from '@/lib/supabase';
import resend from '@/lib/resend';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token fehlt' },
        { status: 400 }
      );
    }

    // Finde die Registrierung mit dem Token
    const { data: registration, error: findError } = await supabase
      .from('registrations')
      .select('*')
      .eq('confirmation_token', token)
      .single() as { data: Registration | null; error: unknown };

    if (findError || !registration) {
      return NextResponse.json(
        { error: 'Ungültiger Token' },
        { status: 400 }
      );
    }

    // Überprüfe, ob der Token abgelaufen ist
    const now = new Date();
    const expiresAt = new Date(registration.token_expires_at);
    
    if (now > expiresAt) {
      // Token ist abgelaufen, lösche die Registrierung
      await supabase
        .from('registrations')
        .delete()
        .eq('id', registration.id);

      return NextResponse.json(
        { error: 'Der Bestätigungslink ist abgelaufen. Bitte registriere dich erneut.' },
        { status: 400 }
      );
    }

    // Aktualisiere den Status
    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        status: 'confirmed' as const,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', registration.id);

    if (updateError) {
      console.error("Fehler beim Aktualisieren des Status:", updateError);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren der Registrierung. Bitte versuche es später erneut.' },
        { status: 500 }
      );
    }

    // Überprüfe, ob die Aktualisierung erfolgreich war
    const { data: updatedRegistration, error: checkError } = await supabase
      .from('registrations')
      .select('status')
      .eq('id', registration.id)
      .single();
      
    if (checkError || !updatedRegistration || updatedRegistration.status !== 'confirmed') {
      console.error("Status wurde nicht aktualisiert:", checkError || "Status nicht geändert");
      // Trotzdem fortfahren, da dies ein nicht-kritischer Fehler ist
    }

    // Sende Willkommens-E-Mail
    if (!resend) {
      console.error('Resend ist nicht initialisiert. Bestätigungs-E-Mail kann nicht gesendet werden.');
      
      // Aktualisiere den Status auf confirmed_without_email
      await supabase
        .from('registrations')
        .update({
          status: 'confirmed_without_email',
          email_error: 'Resend nicht initialisiert bei Bestätigung'
        })
        .eq('id', registration.id);
    } else {
      try {
        const senderName = 'Sören von Gedenkseiten.ai';
        const senderEmail = 'hello@gedenkseiten.ai';
        const fromEmail = `${senderName} <${senderEmail}>`;
        
        await resend.emails.send({
          from: fromEmail,
          to: registration.email,
          subject: 'Willkommen bei Gedenkseiten.ai',
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Willkommen bei Gedenkseiten.ai</title>
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
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
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
              
              .success-checkmark {
                text-align: center;
                margin: 32px 0;
                font-size: 48px;
                color: #4CAF50;
              }
              
              .highlight {
                background-color: #f1f7ff;
                border-left: 4px solid #475EEC;
                padding: 16px;
                border-radius: 4px;
                margin: 24px 0;
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
                <div class="greeting">Hallo ${registration.name},</div>
                
                <div class="success-checkmark">✓</div>
                
                <div class="message">
                  <p><strong>Herzlichen Glückwunsch!</strong> Deine E-Mail-Adresse wurde erfolgreich bestätigt.</p>
                  <p>Vielen Dank für die Bestätigung deiner E-Mail-Adresse.</p>
                </div>
                
                <div class="highlight">
                  <p>Wir informieren dich, sobald unser Service verfügbar ist. Du wirst zu den ersten gehören, die Zugang bekommen.</p>
                </div>
                
                <p>Falls du Fragen hast oder Hilfe benötigst, zögere nicht, uns zu kontaktieren.</p>
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
        
        // Nach erfolgreicher Email, update auf voll bestätigt
        await supabase
          .from('registrations')
          .update({
            status: 'confirmed_with_email'
          })
          .eq('id', registration.id);
          
      } catch (emailError) {
        console.error('Fehler beim Senden der Willkommens-E-Mail:', emailError);
        
        // Aktualisiere den Status auf confirmed_without_email und speichere den Fehler
        await supabase
          .from('registrations')
          .update({
            status: 'confirmed_without_email',
            email_error: typeof emailError === 'object' ? 
              JSON.stringify(emailError, Object.getOwnPropertyNames(emailError)) : 
              String(emailError)
          })
          .eq('id', registration.id);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'E-Mail-Adresse erfolgreich bestätigt'
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
} 