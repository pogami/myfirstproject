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

    // Create checkout session with custom branding
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: true,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
              success_url: `${request.nextUrl.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${request.nextUrl.origin}/payment-failed?error=user_cancelled`,
      metadata: {
        userId: userId,
      },
      // Enhanced UI customization to match your website
      ui_mode: 'hosted',
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      // Custom branding and messaging
      custom_text: {
        submit: {
          message: '🎓 Join thousands of students already using CourseConnect to excel in their studies! Your subscription unlocks advanced AI features, voice input, image analysis, and much more.',
        },
      },
      // Custom fields for better user experience
      custom_fields: [
        {
          key: 'student_id',
          label: {
            type: 'custom',
            custom: 'Student ID (Optional)',
          },
          type: 'text',
          optional: true,
        },
        {
          key: 'university',
          label: {
            type: 'custom',
            custom: 'University/School (Optional)',
          },
          type: 'text',
          optional: true,
        },
      ],
      // Allow promotion codes for discounts
      allow_promotion_codes: true,
      // Subscription settings
      subscription_data: {
        metadata: {
          userId: userId,
          plan: 'scholar',
          source: 'website',
        },
        trial_period_days: 14, // 14-day free trial
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
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
      { error: 'Failed to create checkout session. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
