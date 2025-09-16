import { NextRequest, NextResponse } from 'next/server';

// Mock email service - in production, you'd use SendGrid, Mailchimp, etc.
const emailSubscribers: string[] = [];

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (emailSubscribers.includes(email)) {
      return NextResponse.json(
        { 
          message: 'Email already subscribed! You\'ll receive updates about new features and improvements.',
          alreadySubscribed: true
        },
        { status: 200 }
      );
    }

    // Add email to subscribers list
    emailSubscribers.push(email);

    // In production, you would:
    // 1. Save to database
    // 2. Send welcome email
    // 3. Add to email marketing service (Mailchimp, SendGrid, etc.)
    // 4. Send confirmation email

    console.log('New email subscriber:', email);
    console.log('Total subscribers:', emailSubscribers.length);

    return NextResponse.json(
      { 
        message: 'Successfully subscribed! You\'ll receive updates about new features and improvements. You can also use this email to create your CourseConnect account.',
        subscriberCount: emailSubscribers.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Optional: GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    );
  }

  const isSubscribed = emailSubscribers.includes(email);

  return NextResponse.json({
    email,
    isSubscribed,
    subscriberCount: emailSubscribers.length
  });
}
