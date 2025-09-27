// app/api/checkout/book/route.js
import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function createCheckoutSession(req) {
  try {
    const { default: Stripe } = await import('stripe')
    const secretKey = process.env.STRIPE_SECRET_KEY
    const priceId = process.env.STRIPE_PRICE_ID_BOOK
    const productId = process.env.STRIPE_PRODUCT_ID_BOOK || null
    const defaultAmount = Number(process.env.BOOK_PRICE_AMOUNT_CENTS || '2999') || 2999
    const defaultCurrency = (process.env.BOOK_PRICE_CURRENCY || 'usd').toLowerCase()
    const shippingRateFixed = process.env.STRIPE_SHIPPING_RATE_ID || null

    if (!secretKey) {
      return NextResponse.json({ ok: false, error: 'STRIPE_SECRET_KEY missing' }, { status: 500 })
    }

    const jar = await cookies()
    let uid = jar.get('uid')?.value
    if (!uid) {
      uid = randomUUID()
      jar.set('uid', uid, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    const hdrs = await headers()
    const host = hdrs.get('host')
    const proto = hdrs.get('x-forwarded-proto') || 'https'
    const origin = `${proto}://${host}`

    // Allow server to use a specific recurring price or create an ad-hoc price
    const stripe = new Stripe(secretKey)

    let lineItems
    if (priceId && priceId.startsWith('price_')) {
      lineItems = [{ price: priceId, quantity: 1 }]
    } else if (priceId && priceId.startsWith('prod_')) {
      // If a product ID was mistakenly supplied, create a one-off price for it
      const price = await stripe.prices.create({
        currency: defaultCurrency,
        unit_amount: defaultAmount,
        product: priceId,
      })
      lineItems = [{ price: price.id, quantity: 1 }]
    } else if (productId) {
      const price = await stripe.prices.create({
        currency: defaultCurrency,
        unit_amount: defaultAmount,
        product: productId,
      })
      lineItems = [{ price: price.id, quantity: 1 }]
    } else {
      lineItems = [
        {
          price_data: {
            currency: defaultCurrency,
            product_data: { name: 'Sixth Sense Cooking (Hardcover)' },
            unit_amount: defaultAmount,
          },
          quantity: 1,
        },
      ]
    }

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

