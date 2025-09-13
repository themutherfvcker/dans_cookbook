// app/api/subscription/route.js
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { default: Stripe } = await import('stripe');
    const secret = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID_SUB; // recurring $5/month
    if (!secret || !priceId) {
      return NextResponse.json(
        { ok: false, error: 'Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID_SUB' },
        { status: 500 }
      );
    }

    const jar = await cookies();
    const uid = jar.get('uid')?.value;
    if (!uid) {
      return NextResponse.json(
        { ok: false, error: 'No uid; visit /api/session first' },
        { status: 400 }
      );
    }

    const hdrs = await headers();
    const host = hdrs.get('host');
    const proto = hdrs.get('x-forwarded-proto') || 'https';
    const origin = `${proto}://${host}`;

    const { success_url, cancel_url } = await req.json().catch(() => ({ success_url: null, cancel_url: null }));

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [ { price: priceId, quantity: 1 } ],
      metadata: { uid },
      client_reference_id: uid,
      success_url: success_url || `${origin}/success`,
      cancel_url: cancel_url || `${origin}/cancel`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}

