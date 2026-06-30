import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_API = 'https://api.stripe.com/v1';
const PRICE_ID = process.env.STRIPE_TI_PRICE_ID || 'price_1TMROa0r44KWiPLvHtOXzzK8';
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  if (!SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('success_url', `${req.headers.get('origin') || 'https://tenders.nasyhub.com'}/premium/success?session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${req.headers.get('origin') || 'https://tenders.nasyhub.com'}/premium`);
    params.append('line_items[0][price]', PRICE_ID);
    params.append('line_items[0][quantity]', '1');
    params.append('customer_email', email);
    params.append('metadata[source]', 'tender-intelligence');
    params.append('subscription_data[trial_period_days]', '7');

    const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Stripe error');
    }

    const session = await response.json();
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
