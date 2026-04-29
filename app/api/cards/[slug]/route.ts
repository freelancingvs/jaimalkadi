import { NextRequest, NextResponse } from 'next/server';
import { deleteCard } from '@/lib/cards';
import { isAuthenticated } from '@/lib/auth';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const loggedIn = await isAuthenticated();
  if (!loggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  const { getCard } = await import('@/lib/cards');
  const existingCard = await getCard(slug);
  if (existingCard) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import('@vercel/blob');
      if (existingCard.imageUrl && existingCard.imageUrl.includes('vercel-storage.com')) {
        try { await del(existingCard.imageUrl); } catch (e) { console.error('Error deleting blob image:', e); }
      }
      if (existingCard.audioUrl && existingCard.audioUrl.includes('vercel-storage.com')) {
        try { await del(existingCard.audioUrl); } catch (e) { console.error('Error deleting blob audio:', e); }
      }
    }
  }

  await deleteCard(slug);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const loggedIn = await isAuthenticated();
    if (!loggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Multipart form-data required' }, { status: 400 });
    }

    const form = await request.formData();
    const title = form.get('title') as string | null;
    const location = form.get('location') as string | null;
    const mapUrl = form.get('mapUrl') as string | null;
    const message = form.get('message') as string | null;
    
    const { updateCard, getCard } = await import('@/lib/cards');
    const existingCard = await getCard(slug);
    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Featured image
    const imageFile = form.get('image') as File | null;
    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      if (process.env.BLOB_READ_WRITE_TOKEN && existingCard.imageUrl && existingCard.imageUrl.includes('vercel-storage.com')) {
        const { del } = await import('@vercel/blob');
        try { await del(existingCard.imageUrl); } catch (e) { console.error('Error deleting old blob image:', e); }
      }
      imageUrl = await saveFile(imageFile, slug, 'images');
    }

    // Audio track (music only)
    let audioUrl: string | undefined;
    const audioFile = form.get('audio') as File | null;
    if (audioFile && audioFile.size > 0) {
      if (process.env.BLOB_READ_WRITE_TOKEN && existingCard.audioUrl && existingCard.audioUrl.includes('vercel-storage.com')) {
        const { del } = await import('@vercel/blob');
        try { await del(existingCard.audioUrl); } catch (e) { console.error('Error deleting old blob audio:', e); }
      }
      audioUrl = await saveFile(audioFile, slug, 'audio');
    }

    const updates: any = {};
    if (title !== null) updates.title = title || undefined;
    if (location !== null) updates.location = location || undefined;
    if (mapUrl !== null) updates.mapUrl = mapUrl || undefined;
    if (message !== null) updates.message = message;
    if (imageUrl) updates.imageUrl = imageUrl;
    if (audioUrl) updates.audioUrl = audioUrl;

    const updated = await updateCard(slug, updates);

    if (!updated) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

async function saveFile(file: File, slug: string, prefix: string): Promise<string> {
  const path = await import('path');
  const fs = await import('fs');

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const ext = file.name.split('.').pop() || 'tmp';
    const blob = await put(`${prefix}/${slug}.${ext}`, file, { 
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });
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
