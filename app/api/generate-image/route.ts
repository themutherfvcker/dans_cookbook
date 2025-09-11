// app/api/generate-image/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

// Ensure we use Node runtime (image gen can take a few seconds)
export const runtime = 'nodejs';
export const maxDuration = 60; // give the function time to finish on Vercel

// Tiny helper: pick whichever env var you already set
function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json().catch(() => ({} as any));
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ ok: false, error: 'Missing prompt' }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'GEMINI_API_KEY (or GOOGLE_API_KEY) is not set' },
        { status: 500 }
      );
    }

    // Find (or create) the user based on the uid cookie
    const jar = await cookies();
    let uid = jar.get('uid')?.value ?? null;

    let user = uid
      ? await prisma.user.findUnique({ where: { id: uid }, select: { id: true, credits: true } })
      : null;

    if (!user) {
      const created = await prisma.user.create({
        data: { credits: 25, plan: 'free' },
        select: { id: true, credits: true },
      });
      uid = created.id;
      user = created;

      // set cookie (secure on Vercel)
      const secure = !!process.env.VERCEL;
      jar.set('uid', uid, {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    if (user.credits <= 0) {
      return NextResponse.json({ ok: false, error: 'No credits left' }, { status: 402 });
    }

    // Dynamically import the new SDK at runtime
    const { GoogleGenAI } = await import('@google/genai');

    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GENAI_IMAGE_MODEL || 'gemini-2.5-flash-image-preview';

    // Generate the image from a text prompt
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // The image bytes come back as inlineData on a part
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.data);
    if (!imagePart) {
      return NextResponse.json({ ok: false, error: 'No image returned' }, { status: 500 });
    }

    const base64 = imagePart.inlineData.data as string;

    // Deduct 1 credit & record the ledger atomically
    await prisma.$transaction([
      prisma.user.update({ where: { id: uid! }, data: { credits: { decrement: 1 } } }),
      prisma.ledger.create({ data: { userId: uid!, delta: -1, reason: 'usage:generate' } }),
    ]);

    // Return a data URL so the client can <img src="..."> directly
    // Gemini returns PNG bytes by default; if you later add MIME detection, adapt here.
    return NextResponse.json({
      ok: true,
      dataUrl: `data:image/png;base64,${base64}`,
      model,
    });
  } catch (err: any) {
    console.error('generate-image error:', err);
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
