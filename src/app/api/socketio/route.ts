import { NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest) {
  return new NextResponse('Socket.IO server is running', { status: 200 });
}

export function POST(req: NextRequest) {
  return new NextResponse('Socket.IO server is running', { status: 200 });
}
