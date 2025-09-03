// app/api/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const jar = await cookies();
  let uid = jar.get('uid')?.value;

  let user = null as null | { id: string; credits: number };

  if (uid) {
    // try to find existing user by cookie
    user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, credits: true },
    });
  }

  if (!user) {
    // create a new user (25 free credits) and set cookie
    const created = await prisma.user.create({
      data: { credits: 25, plan: 'free' },
      select: { id: true, credits: true },
    });
    uid = created.id;

    // secure cookie in prod; lax + httpOnly
    const secure = !!process.env.VERCEL;
    jar.set('uid', uid, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    user = created;
  }

  return NextResponse.json({ ok: true, uid, credits: user.credits });
}
