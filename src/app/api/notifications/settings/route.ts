import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, this would be stored in a database
const notificationSettings: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const { userId, settings } = await request.json();

    if (!userId || !settings) {
      return NextResponse.json(
        { error: 'User ID and settings are required' },
        { status: 400 }
      );
    }

    // Store notification settings for the user
    notificationSettings[userId] = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Notification settings updated for user ${userId}:`, settings);

    return NextResponse.json({
      message: 'Notification settings saved successfully',
      settings: notificationSettings[userId]
    });

  } catch (error: any) {
    console.error('Error saving notification settings:', error);
    
    return NextResponse.json(
      { error: 'Failed to save notification settings' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const settings = notificationSettings[userId] || null;

    return NextResponse.json({
      settings
    });

  } catch (error: any) {
    console.error('Error fetching notification settings:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}
