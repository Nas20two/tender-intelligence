import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const premiumCookie = cookieStore.get('ti_premium');

    if (!premiumCookie?.value) {
      return NextResponse.json({
        premium: false,
        remainingQueries: 5
      });
    }

    try {
      const data = JSON.parse(atob(premiumCookie.value));
      return NextResponse.json({
        premium: true,
        email: data.email,
        status: data.status,
        activatedAt: data.activated_at
      });
    } catch {
      // Invalid cookie, treat as free
      return NextResponse.json({
        premium: false,
        remainingQueries: 5
      });
    }
  } catch (error) {
    console.error('[Premium Check]', error);
    return NextResponse.json({ premium: false, remainingQueries: 5 });
  }
}
