'use client';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Book } from './types';
import SortableItem from './sortableItem';

interface TrackListProps {
  books: Book[];
  onRemove: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onClearAll: () => void;
}

export default function TrackList({ books, onRemove, onDragEnd, onClearAll }: TrackListProps) {
  return (
    <div className="bg-white p-4 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg ml-2 font-bold m-0">Track List</h2>
        <button
          onClick={onClearAll}
          className="px-1.5 py-1.5 mr-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Clear All
        </button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={books.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {books.map((book) => (
            <SortableItem
              key={book.id}
              book={book}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      {books.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>Your reading list is empty.</p>
          <p className="text-sm">Search for books to add them to your list.</p>
        </div>
      )}
    </div>
  );
}