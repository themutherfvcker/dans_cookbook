// app/api/billing-portal/route.js
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { default: Stripe } = await import('stripe');
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ ok: false, error: 'STRIPE_SECRET_KEY missing' }, { status: 500 });
    }

    const jar = await cookies();
    const uid = jar.get('uid')?.value;
    if (!uid) return NextResponse.json({ ok: false, error: 'No uid cookie' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: uid }, select: { stripeId: true } });
    if (!user?.stripeId) return NextResponse.json({ ok: false, error: 'No Stripe customer on file' }, { status: 400 });

    const hdrs = await headers();
    const host = hdrs.get('host');
    const proto = hdrs.get('x-forwarded-proto') || 'https';
    const origin = `${proto}://${host}`;

    const stripe = new (await import('stripe')).default(secret);
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeId,
      return_url: `${origin}/account`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

