'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookieReceipt from './bookieReceipt';

// Types
interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishYear: number;
  isbn?: string;
  coverUrl?: string;
}

// Sortable Item Component
const SortableItem = ({ book, onRemove }: { book: Book; onRemove: (id: string) => void }) => {
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
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [userName, setUserName] = useState("Bookworm");
  const [showOldReceipt, setShowOldReceipt] = useState(false);

  const isValidISBN = (query: string) => {
    const cleaned = query.replace(/-/g, '');
    return cleaned.length === 10 || cleaned.length === 13;
  };

  // Search and API logic
  const searchBooks = async (query: string) => {
    if (!query) return;

    setIsSearching(true);
    let results: Book[] = [];

    // Try Open Library first
    const olResponse = await fetch(
      `https://openlibrary.org/search.json?${isValidISBN(query) ? `isbn=${query}` : `title=${encodeURIComponent(query)}`}`
    );
    const olData = await olResponse.json();
    
    if (olData.docs?.length > 0) {
      results = olData.docs.slice(0, 5).map((doc: any) => ({
        title: doc.title,
        author: doc.author_name?.join(', ') || 'Unknown',
        genre: doc.subject?.slice(0, 2).join(', ') || 'General',
        publishYear: doc.first_publish_year || doc.publish_year?.[0] || new Date().getFullYear(),
        isbn: doc.isbn?.[0],
        coverUrl: doc.cover_i 
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : '/images/enchanted_book.jpg'
      }));
    }

    // Fallback to Google Books
    if (results.length === 0) {
      const gbResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
      );
      const gbData = await gbResponse.json();
      
      if (gbData.items?.length > 0) {
        results = gbData.items.slice(0, 5).map((item: any) => ({
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.join(', ') || 'Unknown',
          genre: item.volumeInfo.categories?.[0] || 'General',
          publishYear: parseInt(item.volumeInfo.publishedDate?.substring(0, 4)) || new Date().getFullYear(),
          isbn: item.volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier,
          coverUrl: item.volumeInfo.imageLinks?.thumbnail || '/images/enchanted_book.jpg'
        }));
      }
    }

    setSearchResults(results);
    setNoResults(results.length === 0);
    setIsSearching(false);
  };

  useEffect(() => {
    if (debouncedQuery) {
      searchBooks(debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleSearchSelect = (book: Book) => {
    setBooks(prev => [...prev, { ...book, id: Date.now().toString() }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setBooks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-between gap-8 text-black">
      {/* Receipt Section */}
      <div className="w-1/2">
        {showOldReceipt ? (
          <div className="w-full bg-[#faf6eb] p-6 shadow-lg rounded-lg border-2 border-dashed border-gray-300 
            bg-gradient-to-br from-[#fffdf6] via-[#fcf9f0] to-[#faf6eb]">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-black text-gray-800">BOOKIE</h1>
              <p className="text-sm text-gray-600">Literary Wager Receipt</p>
            </div>

            <div className="space-y-4">
              {books.map((book) => (
                <div key={book.id} className="border-b border-gray-200 pb-2">
                  <div className="font-bold text-red-600 uppercase text-sm">{book.genre}</div>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-lg font-semibold">{book.title}</span>
                      <span className="text-sm text-gray-600 ml-2">- {book.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-300">
              <div className="flex justify-between font-bold">
                <span>TOTAL SELECTIONS:</span>
                <span>{books.length}</span>
              </div>
            </div>
          </div>
        ) : (
          <BookieReceipt books={books} userName={userName} />
        )}
        
        <div className="mt-4 flex justify-center">
          <button 
            onClick={() => setShowOldReceipt(!showOldReceipt)} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Switch to {showOldReceipt ? 'New' : 'Old'} Receipt Style
          </button>
        </div>
      </div>

      {/* Search and Track List */}
      <div className="w-1/3 flex flex-col gap-6 text-black">
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-bold mb-4">User Settings</h2>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              id="username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-bold mb-4">Search Books</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-400"
            />
            
            {isSearching && <div className="absolute top-12 p-2 text-sm">Searching...</div>}
            
            {searchResults.length > 0 && (
              <div className="absolute top-12 w-full bg-white border rounded shadow-lg z-10">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleSearchSelect(result)}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b flex items-center"
                  >
                    <div className="w-[75px] h-[100px] flex justify-center items-center overflow-hidden mr-4">
                      <img 
                        src={result.coverUrl} 
                        alt={result.title}
                        className="max-h-full max-w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/images/enchanted_book.jpg';
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold text-left">{result.title}</div>
                      <div className="text-sm text-gray-600 text-left">{result.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {noResults && debouncedQuery && (
              <div className="text-sm text-red-600 mt-2">
                No results found.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-bold mb-4">Track List</h2>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={books.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {books.map((book) => (
                <SortableItem
                  key={book.id}
                  book={book}
                  onRemove={handleRemoveBook}
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
      </div>
    </div>
  );
}