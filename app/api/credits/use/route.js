// app/api/credits/use/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const jar = await cookies();
    const uid = jar.get('uid')?.value;
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'No uid cookie. Visit /api/session first.' }, { status: 400 });
    }

    const { amount } = await request.json().catch(() => ({ amount: 1 }));
    const spend = Number.isFinite(amount) ? Math.max(1, Math.min(1000, Math.floor(amount))) : 1;

    let newBalance = null;

    await prisma.$transaction(async (tx) => {
      // Decrement only if there are enough credits (atomic)
      const updated = await tx.user.updateMany({
        where: { id: uid, credits: { gte: spend } },
        data: { credits: { decrement: spend } },
      });

      if (updated.count === 0) {
        throw new Error('INSUFFICIENT_CREDITS');
      }

      await tx.creditLedger.create({
        data: { userId: uid, delta: -spend, reason: 'usage:generate', ref: undefined },
      });

      const after = await tx.user.findUnique({ where: { id: uid }, select: { credits: true } });
      newBalance = after?.credits ?? null;
    });

    return NextResponse.json({ ok: true, credits: newBalance });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg === 'INSUFFICIENT_CREDITS' ? 402 : 500; // 402 = Payment Required (nice semantic)
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
