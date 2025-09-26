import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { customerId, priceId, userId, paymentMethodId } = await request.json();

    if (!customerId || !priceId || !userId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId,
        plan: 'scholar',
      },
      trial_period_days: 14, // 14-day free trial
    });

    return NextResponse.json({ 
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      status: subscription.status
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    
    return NextResponse.json(
      { error: 'Failed to create subscription. Please try again or contact support.' },
      { status: 500 }
    );
  }
}


