// Simple echo route to confirm POST wiring returns JSON
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function POST(req) {
  let body = null
  let text = null
  try {
    const ct = req.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      body = await req.json()
    } else {
      text = await req.text()
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to parse body', detail: String(e?.message || e) }, { status: 400 })
  }

  // reflect headers minimally (helps debug proxies)
  const headers = {}
  for (const [k, v] of req.headers.entries()) headers[k] = v

  return NextResponse.json({ ok: true, headers, body, text })
}
