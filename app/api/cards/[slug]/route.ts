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

  await deleteCard(slug);
  return NextResponse.json({ success: true });
}
