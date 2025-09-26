import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Store verification codes in memory (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate .edu email
    if (!email.toLowerCase().endsWith('.edu')) {
      return NextResponse.json(
        { error: 'Email must be a valid .edu address' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the code
    verificationCodes.set(email.toLowerCase(), { code, expires });

    // Send email
    try {
      const { data, error } = await resend.emails.send({
        from: 'CourseConnect <onboarding@resend.dev>',
        to: [email],
        subject: 'CourseConnect - School Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin: 0;">CourseConnect</h1>
              <p style="color: #666; margin: 5px 0;">AI-Powered Learning Platform</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">School Email Verification</h2>
              <p style="color: #4b5563; margin: 0 0 30px 0;">
                Use this verification code to confirm your school email address:
              </p>
              
              <div style="background: white; border: 2px solid #7c3aed; border-radius: 8px; padding: 20px; margin: 20px 0; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #7c3aed; letter-spacing: 5px;">${code}</span>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
                This code will expire in 10 minutes.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
              <p>If you didn't request this verification, please ignore this email.</p>
              <p>© 2024 CourseConnect. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json(
          { error: 'Failed to send verification email' },
          { status: 500 }
        );
      }

      console.log('Verification email sent:', data);
      return NextResponse.json({ 
        success: true, 
        message: 'Verification code sent successfully' 
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
