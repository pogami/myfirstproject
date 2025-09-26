import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { priceId, userId, userEmail } = await request.json();

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: priceId and userId are required' },
        { status: 400 }
      );
    }

    // Validate priceId format
    if (!priceId.startsWith('price_')) {
      return NextResponse.json(
        { error: 'Invalid price ID format. Please check your Stripe configuration.' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: userId,
          },
        });
      }
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create payment intent for subscription
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 499, // $4.99 in cents
      currency: 'usd',
      customer: customer.id,
      metadata: {
        userId: userId,
        plan: 'scholar',
        priceId: priceId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id 
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid payment configuration. Please check your Stripe setup.' },
        { status: 400 }
      );
    }
    
    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Payment authentication failed. Please contact support.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again or contact support.' },
      { status: 500 }
    );
  }
}


