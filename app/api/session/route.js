// =============================================================
// FILE: app/api/session/route.js
// PURPOSE: Create/fetch anonymous session via uid cookie.
// - Uses uid as User.id in DB
// - Grants 25 starter credits on first visit
// - Writes a signup_bonus row if a Ledger table exists
// =============================================================

import { NextResponse } from 'next/server'
import { cookies as cookieStore } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Helper that works with either Ledger or CreditLedger model names
async function createLedger(tx, data) {
  if (tx.ledger?.create) {
    try { return await tx.ledger.create({ data }) } catch { return null }
  }
  if (tx.creditLedger?.create) {
    try { return await tx.creditLedger.create({ data }) } catch { return null }
  }
  return null
}

export async function GET() {
  const jar = await cookieStore()
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

  // Use cookie uid as primary id
  let user = await prisma.user.findUnique({ where: { id: uid } })
  if (!user) {
    user = await prisma.user.create({ data: { id: uid, credits: 25 } })
    // Best-effort ledger entry
    await createLedger(prisma, { userId: user.id, amount: 25, reason: 'signup_bonus' })
  }

  return NextResponse.json({ ok: true, uid, balance: user.credits })
}
