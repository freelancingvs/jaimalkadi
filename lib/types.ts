export type CardType = 'event' | 'music' | 'promotion';

export interface Card {
  slug: string;
  type: CardType;
  title?: string;
  location?: string;
  mapUrl?: string;
  message?: string;
  audioUrl?: string; // for music
  imageUrl?: string; // for OG thumbnail/featured image
  createdAt: string;
}
