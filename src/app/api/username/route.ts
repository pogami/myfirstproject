import { NextRequest, NextResponse } from 'next/server';
import { validateUsernameLocal } from '@/lib/username';

// In-memory reservation store with TTL (per server instance)
type Reservation = { username: string; expiresAt: number };
const RESERVATIONS = new Map<string, Reservation>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function purgeExpired() {
  const now = Date.now();
  for (const [key, value] of RESERVATIONS.entries()) {
    if (value.expiresAt <= now) RESERVATIONS.delete(key);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, username } = await req.json();
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing username' }, { status: 400 });
    }

    purgeExpired();

    const lower = username.trim().toLowerCase();

    // Validate syntax/profanity/reserved locally
    const validation = validateUsernameLocal(username);
    if (!validation.isValid) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 200 });
    }

    const now = Date.now();

    if (action === 'validate') {
      const reserved = RESERVATIONS.get(lower);
      const available = !reserved || reserved.expiresAt <= now;
      return NextResponse.json({ ok: true, available });
    }

    if (action === 'reserve') {
      const reserved = RESERVATIONS.get(lower);
      if (reserved && reserved.expiresAt > now) {
        return NextResponse.json({ ok: false, error: 'This username is already taken' }, { status: 200 });
      }
      RESERVATIONS.set(lower, { username: lower, expiresAt: now + TTL_MS });
      return NextResponse.json({ ok: true, reservedUntil: now + TTL_MS });
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}





