import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Simple in-memory store for demo (in production, use Redis or database)
let activityCount = 0;
let lastActivity: any = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseName, university, professor, courseCode } = body;

    // Increment activity count
    activityCount++;

    // Store last activity
    lastActivity = {
      id: Date.now().toString(),
      courseName: courseName || 'Course',
      university: university || 'University',
      professor: professor || 'Student',
      courseCode: courseCode || 'COURSE',
      timestamp: Date.now()
    };

    return NextResponse.json({ 
      success: true, 
      activityCount,
      lastActivity 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to track activity' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    activityCount,
    lastActivity 
  });
}
