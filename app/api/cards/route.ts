import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import path from 'path';
import fs from 'fs';
import { saveCard, getAllCards } from '@/lib/cards';
import type { Card, CardType } from '@/lib/types';
import { isAuthenticated } from '@/lib/auth';

// Allow up to 60 seconds for large audio file uploads
export const maxDuration = 60;

function generateSlug(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(7);
  return Array.from(bytes).map((b) => chars[b % chars.length]).join('');
}

/** Save file locally (dev) or to Vercel Blob (prod) */
async function saveFile(file: File, slug: string, prefix: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const ext = file.name.split('.').pop() || 'tmp';
    const blob = await put(`${prefix}/${slug}.${ext}`, file, { access: 'public' });
    return blob.url;
  }

  // Dev fallback: save to public/uploads/
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', prefix);
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const ext = file.name.split('.').pop() || 'tmp';
  const filename = `${slug}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);

  return `/uploads/${prefix}/${filename}`;
}

// GET /api/cards — list all cards (admin only check done in UI, but guard here too)
export async function GET() {
  const loggedIn = await isAuthenticated();
  if (!loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const cards = await getAllCards();
  return NextResponse.json(cards);
}

// POST /api/cards — create a new card
export async function POST(request: NextRequest) {
  try {
    const loggedIn = await isAuthenticated();
    if (!loggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = generateSlug();
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Multipart form-data required' }, { status: 400 });
    }

    const form = await request.formData();
    const type = form.get('type') as CardType;
    const title = (form.get('title') as string) || '';
    const location = (form.get('location') as string) || '';
    const mapUrl = (form.get('mapUrl') as string) || '';
    const message = (form.get('message') as string) || '';

    // Featured image (all types)
    const imageFile = form.get('image') as File | null;
    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      console.log('Saving featured image for slug:', slug);
      imageUrl = await saveFile(imageFile, slug, 'images');
    }

    // Audio track (music only)
    let audioUrl: string | undefined;
    if (type === 'music') {
      const audioFile = form.get('audio') as File | null;
      if (audioFile && audioFile.size > 0) {
        console.log('Saving audio track for slug:', slug);
        audioUrl = await saveFile(audioFile, slug, 'audio');
      }
    }

    const card: Card = {
      slug,
      type,
      title: title || undefined,
      location: location || undefined,
      mapUrl: mapUrl || undefined,
      message,
      audioUrl,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    console.log('Saving card to KV/Store:', slug);
    await saveCard(card);
    
    return NextResponse.json(card, { status: 201 });
  } catch (error: any) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
