import { NextResponse } from 'next/server';
import resend from '@/lib/resend';

export async function GET() {
  // Sammele Debug-Informationen
  const debugInfo = {
    resendInitialized: !!resend,
    apiKeyProvided: !!process.env.RESEND_API_KEY,
    apiKeyFirstChars: process.env.RESEND_API_KEY ? 
      `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 'nicht vorhanden',
  };

  // Versuche eine Verbindung zu testen, wenn Resend initialisiert wurde
  let connectionTest = null;
  let sendTest = null;

  if (resend) {
    try {
      // Teste die Verbindung zu Resend
      const domainsResult = await resend.domains.list();
      connectionTest = {
        success: true,
        domains: domainsResult.data || [],
        error: null
      };

      // Teste das Senden einer E-Mail
      try {
        const senderName = 'Sören von Gedenkseiten.ai';
        const senderEmail = 'hello@gedenkseiten.ai';
        const fromEmail = `${senderName} <${senderEmail}>`;
        
        const emailResult = await resend.emails.send({
          from: fromEmail,
          to: 'delivered@resend.dev', // Spezielle Test-E-Mail-Adresse von Resend
          subject: 'Test E-Mail',
          html: '<p>Dies ist ein Test</p>',
        });

        sendTest = {
          success: true,
          result: emailResult
        };
      } catch (sendError: unknown) {
        sendTest = {
          success: false,
          error: {
            message: sendError instanceof Error ? sendError.message : sendError,
            name: sendError instanceof Error ? sendError.name : undefined,
            stack: sendError instanceof Error ? sendError.stack : undefined
          }
        };
      }
    } catch (error: unknown) {
      connectionTest = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : error,
          name: error instanceof Error ? error.name : undefined,
          stack: error instanceof Error ? error.stack : undefined
        }
      };
    }
  }

  return NextResponse.json({
    debugInfo,
    connectionTest,
    sendTest,
    env: {
      NODE_ENV: process.env.NODE_ENV
    }
  });
} 