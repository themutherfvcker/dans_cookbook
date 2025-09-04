// app/api/stripe/webhook/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // use default API version

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return new NextResponse('Missing Stripe signature or webhook secret', { status: 400 });
  }

  // Read raw body for signature verification
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const credits = parseInt(session.metadata?.credits ?? '0', 10) || 0;
      const userId = session.metadata?.userId ?? session.client_reference_id ?? '';

      if (credits > 0 && userId) {
        await prisma.$transaction([
          prisma.creditLedger.create({
            data: {
              userId,
              delta: credits,
              reason: 'purchase:checkout',
              ref: session.id ?? undefined,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: credits } },
          }),
        ]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Webhook handler error: ${message}`, { status: 500 });
  }
}
