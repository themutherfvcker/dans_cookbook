// app/api/checkout/route.js
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // Load Stripe at runtime
    const { default: Stripe } = await import('stripe');
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: 'STRIPE_SECRET_KEY missing' },
        { status: 500 }
      );
    }

    // Require an existing uid cookie (so the same user gets the credits)
    const jar = await cookies();
    const uid = jar.get('uid')?.value;
    if (!uid) {
      return NextResponse.json(
        { ok: false, error: 'No uid; visit /api/session first' },
        { status: 400 }
      );
    }

    // How many credits to sell this time (default 100)
    const url = new URL(req.url);
    const credits = Math.max(
      1,
      Math.min(100000, parseInt(url.searchParams.get('credits') || '100', 10))
    );

    // Build success/cancel URLs from the actual request host (fixes “new user at 25” issue)
    const hdrs = await headers();
    const host = hdrs.get('host');
    const proto = hdrs.get('x-forwarded-proto') || 'https';
    const origin = `${proto}://${host}`;

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${origin}/?success=1`,
      cancel_url: `${origin}/?canceled=1`,
      // Keep a fixed $5 AUD price; let credits vary (e.g., 25, 100, etc.)
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: { name: `${credits} AI credits` },
            unit_amount: 500, // $5 AUD total
          },
          quantity: 1,
        },
      ],
      metadata: { uid, credits: String(credits) },
      client_reference_id: uid,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
