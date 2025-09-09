// ============================================================================
// /app/api/vertex/imagine/route.js
// Google GenAI (AI Studio API key) — Gemini 2.5 Flash Image Preview
// - No long work inside Prisma tx (generate outside, then decrement credits)
// - Returns JSON only, even on errors
// ENV:
//   GOOGLE_GENAI_API_KEY=...            (required)
// Optional:
//   GENAI_IMAGE_MODEL=gemini-2.5-flash-image-preview
//   IMAGINE_DEBUG=novertex              (returns tiny PNG, still deducts 1 credit)
// ============================================================================

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { GoogleGenAI } from '@google/genai'

const prisma = new PrismaClient()
const DEBUG_SKIP = (process.env.IMAGINE_DEBUG || '').toLowerCase() === 'novertex'

function cfg() {
  return {
    apiKey: process.env.GOOGLE_GENAI_API_KEY || '',
    model: process.env.GENAI_IMAGE_MODEL || 'gemini-2.5-flash-image-preview',
  }
}

function json(data, init = {}) {
  // Always JSON, never HTML
  return NextResponse.json(data, init)
}

async function readPrompt(req) {
  // Accept JSON: { prompt: "..." } or form-encoded prompt, or raw text
  let raw = ''
  try { raw = await req.text() } catch {}
  const ct = (req.headers.get('content-type') || '').toLowerCase()

  if (raw && raw.trim().startsWith('{')) {
    try {
      const j = JSON.parse(raw)
      if (j && typeof j.prompt === 'string') return j.prompt.trim()
    } catch {}
    // tolerate single-quoted JSON-ish
    const m = raw.match(/^\s*\{\s*prompt\s*:\s*(['"])([\s\S]*?)\1\s*\}\s*$/i)
    if (m && m[2]) return m[2].trim()
  }

  if (ct.includes('application/x-www-form-urlencoded')) {
    try {
      const p = new URLSearchParams(raw).get('prompt')
      if (p) return p.trim()
    } catch {}
  }

  if (raw && !ct) return raw.trim()
  return ''
}

function tinyPngDataUrl() {
  // 1x1 transparent PNG
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9U4gq/0AAAAASUVORK5CYII='
  return `data:image/png;base64,${b64}`
}

async function createLedger(tx, data) {
  // support either Ledger or CreditLedger table names
  if (tx.ledger?.create)            { try { return await tx.ledger.create({ data }) } catch {} }
  if (tx.creditLedger?.create)      { try { return await tx.creditLedger.create({ data }) } catch {} }
  if (tx.ledgerEntries?.create)     { try { return await tx.ledgerEntries.create({ data }) } catch {} }
  return null
}

async function ensureUser(id) {
  // Fast upsert (no transaction)
  return prisma.user.upsert({
    where: { id },
    update: {},
    create: { id, credits: 25 },
  })
}

export async function GET() {
  const env = cfg()
  return json({
    ok: true,
    env: {
      modelFromEnv: env.model,
      hasApiKey: !!env.apiKey,
      debugSkipVertex: DEBUG_SKIP,
    },
  })
}

// Helpful for CORS/preflight if you ever call cross-origin
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(req) {
  const env = cfg()
  try {
    if (!env.apiKey) {
      return json(
        { ok: false, error: 'Missing GOOGLE_GENAI_API_KEY. Add it to .env.local and Vercel env.' },
        { status: 500 }
      )
    }

    const prompt = await readPrompt(req)
    if (!prompt) return json({ ok: false, error: 'Missing prompt' }, { status: 400 })

    // uid cookie
    const jar = await cookies()
    let id = jar.get('uid')?.value
    if (!id) {
      id = randomUUID()
      jar.set('uid', id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 })
    }

    // 1) Ensure user + check credits
    const user = await ensureUser(id)
    if (user.credits < 1) {
      return json({ ok: false, error: 'Not enough credits. Please purchase more.' }, { status: 402 })
    }

    // 2) Call model (outside tx)
    let dataUrl = null
    if (DEBUG_SKIP) {
      dataUrl = tinyPngDataUrl()
    } else {
      const ai = new GoogleGenAI({ apiKey: env.apiKey })

      const safetySettings = [
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ]

      let resp
      try {
        resp = await ai.models.generateContent({
          model: env.model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { responseModalities: ['IMAGE'], safetySettings, temperature: 0.9 },
        })
      } catch (e) {
        const msg = e?.message || ''
        if (/(^|\b)(429|RESOURCE_EXHAUSTED|quota exceeded)/i.test(msg)) {
          return json(
            { ok: false, error: 'The image engine is rate-limiting right now. Please try again shortly.' },
            { status: 429 }
          )
        }
        return json({ ok: false, error: msg || 'GENERATION_FAILED' }, { status: 500 })
      }

      const parts = resp?.candidates?.[0]?.content?.parts || []
      for (const p of parts) {
        if (p?.inlineData?.mimeType && p?.inlineData?.data) {
          dataUrl = `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`
          break
        }
        if (p?.media?.mimeType && p?.media?.data) {
          dataUrl = `data:${p.media.mimeType};base64,${p.media.data}`
          break
        }
      }
      if (!dataUrl) {
        return json(
          { ok: false, error: 'GENERATE_FAILED (no image in response)', partsPreview: parts.slice(0, 2) },
          { status: 500 }
        )
      }
    }

    // 3) Short tx: decrement credits + ledger
    const out = await prisma.$transaction(async (tx) => {
      const fresh = await tx.user.findUnique({ where: { id } })
      if (!fresh || fresh.credits < 1) {
        return { balance: fresh?.credits ?? 0 }
      }
      const updated = await tx.user.update({
        where: { id },
        data: { credits: { decrement: 1 } },
      })
      await createLedger(tx, {
        userId: id,
        amount: -1,
        reason: 'image_generation',
        meta: { modelName: env.model, prompt },
      })
      return { balance: updated.credits }
    }, { timeout: 15000 })

    return json({ ok: true, dataUrl, balance: out.balance })
  } catch (err) {
    const msg = err?.message || 'Unknown error'
    return json({ ok: false, error: msg }, { status: 500 })
  }
}
