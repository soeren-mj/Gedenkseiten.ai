import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This API route sends a notification email to the old email address
// when a user requests to change their email.
//
// TODO: Configure email service (Resend, SendGrid, or Supabase Edge Function)
// For now, this is a placeholder that logs the notification.

export async function POST(request: Request) {
  try {
    const { oldEmail, newEmail } = await request.json()

    if (!oldEmail || !newEmail) {
      return NextResponse.json(
        { error: 'Old email and new email are required' },
        { status: 400 }
      )
    }

    // Verify the request is from an authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the oldEmail matches the authenticated user's email
    if (user.email !== oldEmail) {
      return NextResponse.json(
        { error: 'Email mismatch' },
        { status: 403 }
      )
    }

    console.log('[Email Notification] Sending notification to old email:', {
      user: user.id,
      oldEmail,
      newEmail,
      timestamp: new Date().toISOString()
    })

    // TODO: Send actual email via email service
    // Example with Resend:
    //
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    //
    // await resend.emails.send({
    //   from: 'Gedenkseiten.ai <noreply@gedenkseiten.ai>',
    //   to: oldEmail,
    //   subject: 'Änderung deiner E-Mail-Adresse',
    //   html: emailTemplate(oldEmail, newEmail)
    // })

    // For now, just log and return success
    // In production, replace this with actual email sending
    console.log('[Email Notification] Would send email with content:', {
      to: oldEmail,
      subject: 'Änderung deiner E-Mail-Adresse',
      preview: `Jemand hat eine Änderung deiner E-Mail-Adresse von ${oldEmail} zu ${newEmail} beantragt.`
    })

    return NextResponse.json({
      success: true,
      message: 'Notification email sent to old address'
    })

  } catch (error) {
    console.error('[Email Notification] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Email template for old email notification
// This would be used when email service is configured
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function emailTemplate(oldEmail: string, newEmail: string): string {
  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-Mail-Adresse geändert</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
        <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1a1a;">
          Änderung deiner E-Mail-Adresse
        </h1>
        <p style="margin: 0; color: #666;">
          Gedenkseiten.ai
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <p>Hallo,</p>
        <p>
          wir möchten dich darüber informieren, dass eine Änderung deiner E-Mail-Adresse
          für dein Gedenkseiten.ai-Konto beantragt wurde.
        </p>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600;">Änderungsdetails:</p>
          <p style="margin: 0;">
            <strong>Alte E-Mail:</strong> ${oldEmail}<br>
            <strong>Neue E-Mail:</strong> ${newEmail}
          </p>
        </div>

        <p>
          Falls du diese Änderung <strong>nicht</strong> selbst vorgenommen hast,
          kontaktiere bitte umgehend unseren Support.
        </p>

        <p>
          Die Änderung wird erst nach Bestätigung über einen Link wirksam,
          der an die neue E-Mail-Adresse gesendet wurde.
        </p>
      </div>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
          <strong>Brauchst du Hilfe?</strong>
        </p>
        <p style="margin: 0; font-size: 14px; color: #666;">
          Kontaktiere uns unter <a href="mailto:support@gedenkseiten.ai" style="color: #0066cc;">support@gedenkseiten.ai</a>
        </p>
      </div>

      <div style="margin-top: 24px; font-size: 12px; color: #999; text-align: center;">
        <p style="margin: 0;">
          © ${new Date().getFullYear()} Gedenkseiten.ai. Alle Rechte vorbehalten.
        </p>
      </div>
    </body>
    </html>
  `
}
