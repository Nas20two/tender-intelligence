import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_API = 'https://api.stripe.com/v1';
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  if (!SECRET_KEY) {
    return NextResponse.json({ success: false, error: 'Stripe not configured' });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return NextResponse.json({ success: false, error: 'Session ID required' });
    }

    // Verify the session with Stripe
    const response = await fetch(`${STRIPE_API}/checkout/sessions/${session_id}`, {
      headers: {
        'Authorization': `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Invalid session' });
    }

    const session = await response.json();

    // Verify payment was successful
    // Allow: paid (immediate), no_payment_required (free), unpaid (trial subscriptions)
    if (!['paid', 'no_payment_required', 'unpaid'].includes(session.payment_status)) {
      return NextResponse.json({ success: false, error: 'Payment not completed' });
    }

    // Get customer email
    const email = session.customer_email || session.customer_details?.email;

    if (!email) {
      return NextResponse.json({ success: false, error: 'No email found' });
    }

    // Set premium cookie - simple base64 encoded email
    // For production, consider using HTTP-only signed cookies
    const cookieStore = await cookies();
    cookieStore.set('ti_premium', btoa(JSON.stringify({
      email,
      status: 'active',
      activated_at: new Date().toISOString(),
      session_id
    })), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/'
    });

    return NextResponse.json({ 
      success: true,
      email,
      status: 'active'
    });
  } catch (error: any) {
    console.error('[Premium Activate]', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
