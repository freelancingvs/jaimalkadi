import { kvGet, kvSet, kvDel } from './store';
import type { Card } from './types';

const ALL_SLUGS_KEY = 'cards:all';

export async function getAllCards(): Promise<Card[]> {
  const slugs = (await kvGet<string[]>(ALL_SLUGS_KEY)) ?? [];
  const cards = await Promise.all(
    slugs.map((slug) => kvGet<Card>(`card:${slug}`))
  );
  // Filter nulls and return newest-first (slugs are stored newest-first)
  return cards.filter(Boolean) as Card[];
}

export async function getCard(slug: string): Promise<Card | null> {
  return kvGet<Card>(`card:${slug}`);
}

export async function saveCard(card: Card): Promise<void> {
  await kvSet(`card:${card.slug}`, card);
  const slugs = (await kvGet<string[]>(ALL_SLUGS_KEY)) ?? [];
  if (!slugs.includes(card.slug)) {
    slugs.unshift(card.slug); // newest first
    await kvSet(ALL_SLUGS_KEY, slugs);
  }
}

export async function deleteCard(slug: string): Promise<void> {
  await kvDel(`card:${slug}`);
  const slugs = (await kvGet<string[]>(ALL_SLUGS_KEY)) ?? [];
  await kvSet(
    ALL_SLUGS_KEY,
    slugs.filter((s) => s !== slug)
  );
}
