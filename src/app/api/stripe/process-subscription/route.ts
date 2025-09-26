import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, userId } = await request.json();

    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status === 'active') {
      return NextResponse.json({ 
        success: true, 
        subscriptionStatus: 'active',
        plan: 'scholar',
        subscriptionId: subscription.id,
        customerId: subscription.customer
      });
    } else {
      return NextResponse.json(
        { error: 'Subscription not active' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error processing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription: ' + error.message },
      { status: 500 }
    );
  }
}


