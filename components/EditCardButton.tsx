'use client';

import { useState } from 'react';
import EditModal from './EditModal';
import { Card } from '@/lib/types';

interface EditCardButtonProps {
  card: Card;
}

export default function EditCardButton({ card }: EditCardButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-600 hover:text-white transition"
      >
        Edit
      </button>

      <EditModal 
        card={card} 
        open={open} 
        onClose={() => setOpen(false)} 
      />
    </>
  );
}
