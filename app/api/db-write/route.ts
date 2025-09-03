// app/api/db-write/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await prisma.user.create({
      data: {
        // email is optional/unique, leaving it null is fine for this test
        plan: 'free',
        credits: 25,
      },
      select: { id: true, credits: true, createdAt: true },
    });

    // Count total users so we can see growth on repeated clicks
    const userCount = await prisma.user.count();

    return NextResponse.json({ ok: true, user, userCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
