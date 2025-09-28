import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find the customer by user ID
    const customers = await stripe.customers.list({
      limit: 100,
    });

    const customer = customers.data.find(c => c.metadata?.userId === userId);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Find active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel the subscription
    const subscription = subscriptions.data[0];
    const cancelledSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      message: 'Subscription will be cancelled at the end of the billing period',
      subscriptionId: cancelledSubscription.id,
      cancelAt: cancelledSubscription.cancel_at,
      currentPeriodEnd: cancelledSubscription.current_period_end,
    });

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    
    return NextResponse.json(
      { error: 'Failed to cancel subscription. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
