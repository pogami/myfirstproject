import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, userId, userName, userPhotoURL } = body;
    
    console.log('Typing start request:', { chatId, userId, userName, userPhotoURL });
    
    // For now, just return success since Pusher handles typing automatically
    return NextResponse.json({ 
      success: true, 
      message: 'Typing indicator started',
      chatId,
      userId,
      userName,
      userPhotoURL
    });
  } catch (error) {
    console.error('Typing start error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to start typing indicator' 
    }, { status: 500 });
  }
}
