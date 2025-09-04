// app/api/stripe/webhook/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;

  if (!secret || !key) {
    return NextResponse.json(
      { ok: false, error: 'Missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY' },
      { status: 500 }
    );
  }

  // Read raw body for signature verification
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  let event;
  try {
    // No apiVersion here (avoids build-time type/union issues)
    const stripe = new Stripe(key);
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `Signature verification failed: ${msg}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object; // Stripe.Checkout.Session
      const uid = session?.metadata?.uid;
      const credits = Number(session?.metadata?.credits || '0') || 0;

      if (uid && credits > 0) {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: uid },
            data: { credits: { increment: credits } },
          });

          await tx.creditLedger.create({
            data: {
              userId: uid,
              delta: credits,
              reason: 'purchase:checkout',
              ref: session.id ?? null,
            },
          });
        });
      }
    }
  } catch (err) {
    // Log but return 200 so Stripe doesn't keep retrying
    console.error('Webhook handler error:', err);
  }

  return new NextResponse(null, { status: 200 });
}
