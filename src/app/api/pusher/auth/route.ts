import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON and form data
    let socket_id, channel_name;
    
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      socket_id = body.socket_id;
      channel_name = body.channel_name;
    } else {
      // Handle form data - Pusher sends as application/x-www-form-urlencoded
      const formData = await request.formData();
      socket_id = formData.get('socket_id') as string;
      channel_name = formData.get('channel_name') as string;
      
      // If formData is empty, try to parse from URL
      if (!socket_id || !channel_name) {
        const url = new URL(request.url);
        socket_id = url.searchParams.get('socket_id') || '';
        channel_name = url.searchParams.get('channel_name') || '';
      }
    }

    console.log('Pusher auth request:', { socket_id, channel_name });

    // Get user info from request headers or generate guest info
    const userId = request.headers.get('x-user-id') || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userName = request.headers.get('x-user-name') || 'Guest User';
    const userPhotoURL = request.headers.get('x-user-photo') || '';
    
    console.log('User info for auth:', { userId, userName, userPhotoURL });

    // For presence channels, include user info
    if (channel_name.startsWith('presence-')) {
      const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
        user_id: userId,
        user_info: {
          userName,
          userPhotoURL
        }
      });
      console.log('Pusher presence auth success:', { userId, channel_name });
      return new NextResponse(JSON.stringify(authResponse), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // For regular channels, just authorize
    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name);
    console.log('Pusher regular auth success:', { channel_name });
    return new NextResponse(JSON.stringify(authResponse), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Pusher auth error:', error);
    return new NextResponse('Unauthorized', { status: 401 });
  }
}
