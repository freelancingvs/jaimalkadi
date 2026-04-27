// CardList — server component that reads directly from the card store

import Link from 'next/link';
import { getAllCards } from '@/lib/cards';
import CopyLinkButton from '@/components/CopyLinkButton';
import DeleteCardButton from '@/components/DeleteCardButton';
import EditCardButton from '@/components/EditCardButton';

const TYPE_LABELS: Record<string, string> = {
  event: 'Event',
  music: 'Music',
  promotion: 'Promotion',
};

const TYPE_COLORS: Record<string, string> = {
  event: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  music: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  promotion: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  event: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  music: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  ),
  promotion: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.196-.138-.57-.334-1.12-.617a13.36 13.36 0 00-2.694-.963 9.75 9.75 0 01-1.02-3.91A3.75 3.75 0 0112 6.75a3.75 3.75 0 016.494 2.6 9.75 9.75 0 01-1.02 3.91 13.36 13.36 0 00-2.693.963c-.55.283-.924.479-1.12.617m-3.721 0c.36.255.738.48 1.13.672a3.75 3.75 0 003.181 0c.392-.192.77-.417 1.13-.672m-5.44 0l-.16.114a2.25 2.25 0 001.044 4.14l1.2-.172a2.25 2.25 0 001.918-2.225v-.078m-4.002-2.003a13.41 13.41 0 013.72 0" />
    </svg>
  ),
};

export default async function CardList() {
  const cards = await getAllCards();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <p className="text-zinc-400 font-medium text-sm">No cards yet</p>
        <p className="text-zinc-600 text-xs mt-1">
          Click <span className="text-amber-500">Create</span> above to make your first shareable link
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const shareUrl = `${appUrl}/s/${card.slug}`;
        return (
          <div
            key={card.slug}
            className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 p-5 flex flex-col gap-3"
          >
            {/* Type badge + Date */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  TYPE_COLORS[card.type] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
                }`}
              >
                {TYPE_ICONS[card.type]}
                {TYPE_LABELS[card.type] || card.type}
              </span>
              <span className="text-[11px] text-zinc-600">
                {new Date(card.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Title */}
            {card.title && (
              <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                {card.title}
              </h3>
            )}

            {/* Location (event only) */}
            {card.location && (
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="truncate">{card.location}</span>
              </p>
            )}

            {/* Promotion — message snippet */}
            {card.type === 'promotion' && card.message && (
              <p
                className="text-xs text-zinc-500 line-clamp-2 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: card.message.replace(/<[^>]*>/g, ' ').trim().slice(0, 80) + '…',
                }}
              />
            )}

            {/* Music — audio indicator */}
            {card.type === 'music' && card.audioUrl && (
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                Audio track attached
              </p>
            )}

            {/* Slug */}
            <p className="text-[11px] text-zinc-700 font-mono truncate">/s/{card.slug}</p>

            {/* Actions row */}
            <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/[0.06]">
              <CopyLinkButton url={shareUrl} />
              <Link
                href={`/s/${card.slug}`}
                target="_blank"
                rel="noopener"
                className="text-xs text-zinc-600 hover:text-zinc-300 transition"
              >
                Preview ↗
              </Link>
              <EditCardButton card={card} />
              <div className="ml-auto">
                <DeleteCardButton slug={card.slug} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
