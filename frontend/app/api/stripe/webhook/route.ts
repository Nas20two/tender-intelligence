import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const STRIPE_API = 'https://api.stripe.com/v1';
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature if secret is configured
    // For now, parse the event directly
    // In production, verify with stripe.webhooks.constructEvent
    const event = JSON.parse(body);

    // Handle subscription events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[Stripe Webhook] Checkout completed:', session.id, session.customer_email);
        // Premium status is activated via the /api/premium/activate endpoint
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('[Stripe Webhook] Subscription updated:', subscription.id, subscription.status);
        // For now, premium status is managed via cookie (active for 1 year)
        // Future: integrate with Supabase for proper subscription management
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('[Stripe Webhook] Payment failed:', invoice.customer_email);
        break;
      }

      default:
        console.log('[Stripe Webhook] Unhandled event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}