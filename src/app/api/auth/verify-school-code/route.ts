import { NextRequest, NextResponse } from 'next/server';

// Store verification codes in memory (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
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

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Code must be 6 digits' },
        { status: 400 }
      );
    }

    // Get stored verification data
    const storedData = verificationCodes.get(email.toLowerCase());

    if (!storedData) {
      return NextResponse.json(
        { error: 'No verification code found for this email' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email.toLowerCase());
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify the code
    if (storedData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Code is valid - remove it from storage
    verificationCodes.delete(email.toLowerCase());

    // In a real application, you would:
    // 1. Create or update user record with verified school email
    // 2. Set user as verified
    // 3. Grant school-specific permissions
    // 4. Log the verification event

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully',
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
