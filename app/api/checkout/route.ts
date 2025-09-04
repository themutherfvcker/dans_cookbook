// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function GET(request: Request) {
  try {
    // Read credits from query (?credits=100)
    const url = new URL(request.url);
    const credits = parseInt(url.searchParams.get('credits') ?? '100', 10);

    // Simple demo pricing: 100 credits = AUD $5.00
    const amountAudCents = Math.max(1, Math.round((credits / 100) * 500));

    // Determine origin for success/cancel URLs
    const origin =
      request.headers.get('origin') ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Ensure the user has a uid cookie (create one if missing by calling /api/session first)
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
      // attach identifiers so the webhook knows who to credit
      client_reference_id: uid, // also stored by Stripe
      metadata: {
        credits: String(credits),
        userId: uid,
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
