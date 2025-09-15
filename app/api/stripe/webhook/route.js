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

      // One-time credits purchase flow remains supported
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

      // Attach Stripe customer id to user for subscription management
      const customerId = session?.customer;
      if (uid && customerId) {
        await prisma.user.update({ where: { id: uid }, data: { stripeId: String(customerId) } });
      }
    } else if (event.type === 'invoice.paid') {
      // Activate subscription entitlements when first invoice is paid
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const subscriptionId = invoice.subscription;

      if (customerId && subscriptionId) {
        // Look up the user by stripeId
        const user = await prisma.user.findFirst({ where: { stripeId: String(customerId) } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: 'pro-monthly' },
          });
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const customerId = sub.customer;
      if (customerId) {
        const user = await prisma.user.findFirst({ where: { stripeId: String(customerId) } });
        if (user) {
          await prisma.user.update({ where: { id: user.id }, data: { plan: 'free' } });
        }
      }
    }
  } catch (err) {
    // Log but return 200 so Stripe doesn't keep retrying
    console.error('Webhook handler error:', err);
  }

  return new NextResponse(null, { status: 200 });
}
