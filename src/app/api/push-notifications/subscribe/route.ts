import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// VAPID keys for push notifications
// In production, these should be environment variables
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BBNTISOni2FGyolL0qVJVJpnMV0d2q7U7uCxF20qT-KOmP_dSj8Q927pJS5CKuHa8BQ20-miUmfDAbThgbdP2YA',
  privateKey: process.env.VAPID_PRIVATE_KEY || '8eAB81e-XXLZvm8wMQZsMMWs_bhGn_lQRAwUfS08Fpw'
};

// Configure web-push
webpush.setVapidDetails(
  'mailto:courseconnect.noreply@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store push subscriptions (in production, use a database)
const pushSubscriptions: any[] = [];

// POST endpoint to subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingIndex = pushSubscriptions.findIndex(
      sub => sub.endpoint === subscription.endpoint
    );

    if (existingIndex >= 0) {
      // Update existing subscription
      pushSubscriptions[existingIndex] = {
        ...subscription,
        subscribedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
    } else {
      // Add new subscription
      pushSubscriptions.push({
        ...subscription,
        subscribedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      });
    }

    console.log('Push subscription added/updated:', subscription.endpoint);
    console.log('Total subscriptions:', pushSubscriptions.length);

    return NextResponse.json({
      message: 'Successfully subscribed to push notifications',
      subscriptionCount: pushSubscriptions.length
    }, { status: 200 });

  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications' },
      { status: 500 }
    );
  }
}

// GET endpoint to get subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (endpoint) {
    const subscription = pushSubscriptions.find(sub => sub.endpoint === endpoint);
    return NextResponse.json({
      isSubscribed: !!subscription,
      subscription: subscription || null
    });
  }

  return NextResponse.json({
    totalSubscriptions: pushSubscriptions.length,
    subscriptions: pushSubscriptions
  });
}

// DELETE endpoint to unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    const index = pushSubscriptions.findIndex(sub => sub.endpoint === endpoint);
    
    if (index >= 0) {
      pushSubscriptions.splice(index, 1);
      console.log('Push subscription removed:', endpoint);
      
      return NextResponse.json({
        message: 'Successfully unsubscribed from push notifications',
        subscriptionCount: pushSubscriptions.length
      });
    } else {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Push unsubscription error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from push notifications' },
      { status: 500 }
    );
  }
}
