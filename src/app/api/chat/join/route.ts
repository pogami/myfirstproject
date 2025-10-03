import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, userId, userName, userPhotoURL } = body;
    
    console.log('Join chat request:', { chatId, userId, userName, userPhotoURL });
    
    // For now, just return success since Pusher handles presence automatically
    return NextResponse.json({ 
      success: true, 
      message: 'Joined chat successfully',
      chatId,
      userId,
      userName,
      userPhotoURL
    });
  } catch (error) {
    console.error('Join chat error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to join chat' 
    }, { status: 500 });
  }
}
