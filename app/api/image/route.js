// app/api/vertex/imagine/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    const { VertexAI } = await import('@google-cloud/vertexai');

    // Auth via JSON from env (works locally & on Vercel)
    const credentials = process.env.GOOGLE_CREDENTIALS
      ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
      : undefined;

    const project = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION || 'us-central1';
    const modelName = process.env.VERTEX_IMAGE_MODEL || 'imagen-3.0-generate-002';

    if (!project || !credentials) {
      return NextResponse.json({ ok: false, error: 'Google credentials missing' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const prompt = (body.prompt || '').slice(0, 2000).trim();
    if (!prompt) return NextResponse.json({ ok: false, error: 'Missing prompt' }, { status: 400 });

    // 1) Session & credits
    const jar = await cookies();
    const uid = jar.get('uid')?.value;
    if (!uid) return NextResponse.json({ ok: false, error: 'No session' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: uid }, select: { credits: true } });
    if (!user || user.credits < 1) {
      return NextResponse.json({ ok: false, error: 'Not enough credits' }, { status: 402 });
    }

    // 2) Call Vertex Imagen 3
    const vertex = new VertexAI({ project, location, credentials });

    // As of the current SDK, images are generated via the Image generation model in Vertex AI.
    // Some SDKs expose a dedicated image API; here we call the model directly through the Vertex client.
    const client = vertex.preview.getImageGenerationModel
      ? vertex.preview.getImageGenerationModel({ model: modelName })
      : null;

    if (!client) {
      return NextResponse.json({ ok: false, error: 'Image generation model not available in this SDK' }, { status: 500 });
    }

    // Basic generation – 1 image, PNG
    const result = await client.generateImages({
      prompt,
      // You can also pass { negativePrompt, numberOfImages: 1, aspectRatio: '1:1', safetyFilterLevel: 'block_some' }
      // depending on availability in your project/SDK version.
    });

    // Result handling varies slightly by SDK version; normalize to a single PNG base64
    const img = result?.images?.[0];
    const b64 = img?.bytesBase64Encoded || img?.base64Data || img?.imageBytes;
    if (!b64) return NextResponse.json({ ok: false, error: 'No image returned' }, { status: 502 });

    // 3) Deduct 1 credit & record ledger (same pattern you already use)
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: uid },
        data: { credits: { decrement: 1 } },
      });
      await tx.ledger.create({
        data: { userId: uid, delta: -1, reason: 'usage:generate' },
      });
    });

    // Send data URL for easy <img src="...">
    return NextResponse.json({ ok: true, dataUrl: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error('vertex/imagine error', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Vertex error' }, { status: 500 });
  }
}
