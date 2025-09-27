// app/api/checkout/book/route.js
import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function createCheckoutSession(req) {
  try {
    const { default: Stripe } = await import('stripe')
    const secretKey = process.env.STRIPE_SECRET_KEY
    const priceId = process.env.STRIPE_PRICE_ID_BOOK
    const shippingRateFixed = process.env.STRIPE_SHIPPING_RATE_ID || null

    if (!secretKey) {
      return NextResponse.json({ ok: false, error: 'STRIPE_SECRET_KEY missing' }, { status: 500 })
    }

    const jar = await cookies()
    const uid = jar.get('uid')?.value
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'No uid; visit /api/session first' }, { status: 400 })
    }

    const hdrs = await headers()
    const host = hdrs.get('host')
    const proto = hdrs.get('x-forwarded-proto') || 'https'
    const origin = `${proto}://${host}`

    // Allow server to use a specific recurring price or create an ad-hoc price
    const stripe = new Stripe(secretKey)

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Sixth Sense Cooking (Hardcover)' },
              unit_amount: 2999,
            },
            quantity: 1,
          },
        ]

    const params = {
      mode: 'payment',
      success_url: `${origin}/?success=1`,
      cancel_url: `${origin}/?canceled=1`,
      line_items: lineItems,
      metadata: { uid, product: 'book' },
      client_reference_id: uid,
      shipping_address_collection: { allowed_countries: ['AU', 'US', 'GB', 'CA', 'NZ', 'IE', 'DE', 'FR', 'ES', 'IT'] },
    }

    if (shippingRateFixed) {
      params.shipping_options = [{ shipping_rate: shippingRateFixed }]
    }

    const session = await stripe.checkout.sessions.create(params)
    return NextResponse.json({ ok: true, url: session.url })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function GET(req) { return createCheckoutSession(req) }
export async function POST(req) { return createCheckoutSession(req) }

