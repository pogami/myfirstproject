import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';

export async function POST(request: NextRequest) {
  try {
    const { channel, event, data } = await request.json();

    // Trigger the event on the specified channel
    await pusherServer.trigger(channel, event, data);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Pusher send message error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
