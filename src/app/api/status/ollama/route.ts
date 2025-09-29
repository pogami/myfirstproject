import { NextResponse } from 'next/server';
import { checkOllamaStatus } from '@/lib/ollama-file-processor';

export async function GET() {
  try {
    const ok = await checkOllamaStatus();
    return NextResponse.json({ ok });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'unknown' }, { status: 200 });
  }
}



