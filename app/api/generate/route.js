// app/api/generate/route.js
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
      return NextResponse.json(
        { ok: false, error: 'No uid cookie. Visit /api/session first.' },
        { status: 400 }
      );
    }

    const { prompt } = await request.json().catch(() => ({ prompt: '' }));
    const spend = 1;

    let newBalance = null;

    // Atomically spend a credit + ledger it
    await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { id: uid, credits: { gte: spend } },
        data: { credits: { decrement: spend } },
      });

      if (updated.count === 0) throw new Error('INSUFFICIENT_CREDITS');

      await tx.creditLedger.create({
        data: { userId: uid, delta: -spend, reason: 'usage:generate', ref: undefined },
      });

      const after = await tx.user.findUnique({
        where: { id: uid },
        select: { credits: true },
      });
      newBalance = after?.credits ?? null;
    });

    // Demo image service (deterministic by seed). We'll swap this for a real model later.
    const seed = encodeURIComponent((prompt || 'banana').slice(0, 64));
    const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;

    return NextResponse.json({ ok: true, imageUrl, credits: newBalance });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg === 'INSUFFICIENT_CREDITS' ? 402 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
