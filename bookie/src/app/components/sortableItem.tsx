// components/SortableItem.tsx
'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Book } from './types';

interface SortableItemProps {
  book: Book;
  onRemove: (id: string) => void;
}

export default function SortableItem({ book, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 mb-2 bg-gray-50 rounded"
    >
      <div className="flex-1">
        <div className="font-medium">{book.title}</div>
        <div className="text-sm text-gray-600">{book.author}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="p-1 text-gray-400 hover:text-red-500"
          onClick={() => onRemove(book.id)}
        >
          ✕
        </button>
        <button
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      </div>
    </div>
  );
}