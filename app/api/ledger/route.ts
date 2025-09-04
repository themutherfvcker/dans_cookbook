// app/api/ledger/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const jar = await cookies();
    const uid = jar.get('uid')?.value;
    if (!uid) {
      return NextResponse.json(
        { ok: false, error: 'No uid cookie. Visit /api/session first.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, credits: true },
    });

    const ledgers = await prisma.creditLedger.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { createdAt: true, delta: true, reason: true, ref: true },
    });

    return NextResponse.json({ ok: true, user, ledgers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
