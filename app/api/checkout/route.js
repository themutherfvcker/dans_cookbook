// app/api/checkout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Load Stripe at runtime
    const { default: Stripe } = await import('stripe');
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ ok: false, error: 'STRIPE_SECRET_KEY missing' }, { status: 500 });
    }
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

    // Credits from query (?credits=100)
    const url = new URL(request.url);
    const credits = parseInt(url.searchParams.get('credits') ?? '100', 10);
    const amountAudCents = Math.max(1, Math.round((credits / 100) * 500)); // 100 credits -> $5.00 AUD

    // Origin for redirects
    const origin =
      request.headers.get('origin') ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Require session cookie
    const jar = await cookies();
    const uid = jar.get('uid')?.value;
    if (!uid) {
      return NextResponse.json(
        { ok: false, error: 'No uid cookie. Call /api/session first to create a user.' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${origin}/?success=1`,
      cancel_url: `${origin}/?canceled=1`,
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: { name: `${credits} AI credits` },
            unit_amount: amountAudCents,
          },
          quantity: 1,
        },
      ],
      client_reference_id: uid,
      metadata: { credits: String(credits), userId: uid },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
