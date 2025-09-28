import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      title, 
      description, 
      type = 'system', 
      priority = 'medium',
      classId,
      actionUrl 
    } = body;

    // Validate required fields
    if (!userId || !title || !description) {
      return NextResponse.json(
        { error: 'userId, title, and description are required' },
        { status: 400 }
      );
    }

    // Create notification in Firestore
    const notificationData = {
      userId,
      title,
      description,
      type,
      priority,
      classId: classId || null,
      actionUrl: actionUrl || null,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);

    // Send push notification if user has push notifications enabled
    try {
      const pushResponse = await fetch(`${request.nextUrl.origin}/api/push-notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body: description,
          data: {
            notificationId: docRef.id,
            type,
            priority,
            actionUrl,
          },
        }),
      });

      if (!pushResponse.ok) {
        console.warn('Failed to send push notification:', await pushResponse.text());
      }
    } catch (pushError) {
      console.warn('Push notification error:', pushError);
      // Don't fail the main request if push notification fails
    }

    return NextResponse.json({
      success: true,
      notificationId: docRef.id,
      message: 'Notification created successfully',
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
