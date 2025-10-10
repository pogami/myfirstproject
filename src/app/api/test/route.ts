import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST] API called');
    return NextResponse.json({ success: true, message: 'API is working' });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}

