import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, userId, userName, userPhotoURL, message, sources } = body;
    
    console.log('Send message request:', { chatId, userId, userName, userPhotoURL, message: message?.substring(0, 50) + '...', sources });
    
    // For now, just return success since Pusher handles messaging automatically
    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      chatId,
      userId,
      userName,
      userPhotoURL,
      message,
      sources
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send message' 
    }, { status: 500 });
  }
}
