import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return NextResponse.json({ 
        success: true, 
        subscriptionStatus: 'active',
        plan: 'scholar',
        sessionId: session.id,
        subscriptionId: session.subscription
      });
    } else {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment: ' + error.message },
      { status: 500 }
    );
  }
}
