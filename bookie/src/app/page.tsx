'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image'; 
import { useDebounce } from 'use-debounce';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Controls from './controls';
import { Book, OLDoc, GBItem, IndustryIdentifier } from './types';
import BookieStyleReceipt from './receipt_style/bookie_style';
import ClassicReceipt from './receipt_style/classic_style';
import SpotifyStyleReceipt from './receipt_style/wrapped_style';

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
  // Device detection
  const [isMobile, setIsMobile] = useState(false);

  // User data and preferences
  const [userName, setUserName] = useState("Bookworm");
  const [bgPosition, setBgPosition] = useState({ x: 50, y: 50 });
  const [receiptStyle, setReceiptStyle] = useState<'Bookie' | 'Receipt' | 'Spotify'>('Receipt');

  // Book list management
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  // Image generation state
  const receiptRef = useRef<HTMLDivElement>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatingOrDownloading, setGeneratingOrDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'preview'>('controls');

  // Responsive layout detection
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 932);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Local storage handling
  useEffect(() => {
    const savedBooks = localStorage.getItem('books');
    const savedName = localStorage.getItem('userName');
    if (savedBooks) setBooks(JSON.parse(savedBooks));
    if (savedName) setUserName(savedName);
  }, []);

  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  // Image generation logic
  const generateImage = async () =>{
    if (!receiptRef.current) return;

    try {
      setGeneratingOrDownloading(true);
      // Safari & html-to-image issue, check: https://github.com/bubkoo/html-to-image/issues/361
      await toPng(receiptRef.current);
      await toPng(receiptRef.current);
      await toPng(receiptRef.current);
      const dataUrl = await toPng(receiptRef.current);
      setGeneratedImage(dataUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate receipt. Please try again.');
    } finally {
      setGeneratingOrDownloading(false);
    }
  };
  
  // Generate on mount
  useEffect(() => {
    generateImage();
  }, []);

  // Regenerate when state update
  useEffect(() => {
    generateImage();
  },[userName, books, receiptStyle]);

  // Download generated Image
  const downloadReceipt = () => {
    if (!generatedImage) return;

    try {
      setGeneratingOrDownloading(true);
      const link = document.createElement('a');
      link.download = `${userName}-${receiptStyle}.png`;
      link.href = generatedImage;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setGeneratingOrDownloading(false);
    }
  };

  // Book Search functionality
  const searchBooks = useCallback(async (query: string) => {
    if (!query) return;

    setIsSearching(true);
    let results: Book[] = [];

    // Open Library search
    const olResponse = await fetch(
      `https://openlibrary.org/search.json?${isValidISBN(query) ? `isbn=${query}` : `title=${encodeURIComponent(query)}`}`
    );
    const olData = await olResponse.json();
    
    if (olData.docs?.length > 0) {
      results = olData.docs.slice(0, 5).map((doc: OLDoc) => ({
        title: doc.title,
        author: doc.author_name?.join(', ') || 'Unknown',
        genre: doc.subject?.slice(0, 2).join(', ') || 'General',
        publishYear: doc.first_publish_year || doc.publish_year?.[0] || new Date().getFullYear(),
        pages: doc.number_of_pages || 199,
        isbn: doc.isbn?.[0],
        coverUrl: doc.cover_i 
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : '/images/enchanted_book.jpg'
      }));
    }

    // Google Books fallback
    if (results.length === 0) {
      const gbResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
      );
      const gbData = await gbResponse.json();
      
      if (gbData.items?.length > 0) {
        results = gbData.items.slice(0, 5).map((item: GBItem) => ({
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.join(', ') || 'Unknown',
          genre: item.volumeInfo.categories?.[0] || 'General',
          publishYear: parseInt(item.volumeInfo.publishedDate?.substring(0, 4) ?? "0") || new Date().getFullYear(),
          isbn: item.volumeInfo.industryIdentifiers?.find((id: IndustryIdentifier) => id.type === 'ISBN_13')?.identifier,
          pages: item.volumeInfo.pageCount,
          coverUrl: item.volumeInfo.imageLinks?.thumbnail || '/images/enchanted_book.jpg'
        }));
      }
    }

    setSearchResults(results);
    setNoResults(results.length === 0);
    setIsSearching(false);
  }, [setIsSearching]);

  // Event handlers
  const handleSearchSelect = (book: Book) => {
    setBooks(prev => [...prev, { ...book, id: Date.now().toString() }]);
    setSearchQuery('');
    setSearchResults([]);
    generateImage();
  };

  const handleRemoveBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    generateImage();
  };

  const handleClearAll = () => {
    setBooks([]);
    generateImage();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setBooks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    generateImage();
  };

  const randomizeBgPosition = () => {
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    setBgPosition({ x, y });
  };

  // Helper functions
  const isValidISBN = (query: string) => {
    const cleaned = query.replace(/-/g, '');
    return cleaned.length === 10 || cleaned.length === 13;
  };

  useEffect(() => {
    if (debouncedQuery) {
      searchBooks(debouncedQuery);
    }
  }, [debouncedQuery, searchBooks]);


  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col text-black">
        {/* Tab Navigation */}
        <div className="flex mb-4 bg-white rounded shadow overflow-hidden">
          <button 
            className={`flex-1 py-3 font-medium ${activeTab === 'controls' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setActiveTab('controls')}
          >
            Edit List
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${activeTab === 'preview' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>

        <div className={`${activeTab !== 'preview' ? 'absolute left-0 top-0 opacity-0 pointer-events-none' : 'flex justify-center'}`}>
          <div className="w-full max-w-xs">
            {receiptStyle === 'Bookie' && <BookieStyleReceipt ref={receiptRef} books={books} userName={userName} bgPosition={bgPosition} />}
            {receiptStyle === 'Receipt' && <ClassicReceipt ref={receiptRef} books={books} userName={userName} bgPosition={bgPosition}/>}
            {receiptStyle === 'Spotify' && <SpotifyStyleReceipt ref={receiptRef} books={books} userName={userName} bgPosition={bgPosition}/>}
            
            {activeTab === 'preview' && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={downloadReceipt}
                  disabled={generatingOrDownloading}
                  className="px-4 py-2 w-80 bg-red-600 text-white rounded font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {generatingOrDownloading ? 'Generating...' : 'Download Receipt'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={activeTab !== 'controls' ? 'hidden' : 'flex flex-col gap-4'}>
        <Controls
          userName={userName}
          setUserName={setUserName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          noResults={noResults}
          handleSearchSelect={handleSearchSelect}
          receiptStyle={receiptStyle}
          setReceiptStyle={setReceiptStyle}
          downloadReceipt={downloadReceipt}
          generatingOrDownloading={generatingOrDownloading}
          debouncedQuery={debouncedQuery}
          randomizeBgPosition={randomizeBgPosition}
        />

        <div className="bg-white p-4 shadow-lg rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold m-0">Track List</h2>
            <button
              onClick={handleClearAll}
              className="px-1.5 py-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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

  // Desktop Layout (original)
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center gap-8 text-black">
      <div className="w-1/3">
        {receiptStyle === 'Bookie' && <BookieStyleReceipt ref={receiptRef} books={books} userName={userName} bgPosition={bgPosition} />}
        {receiptStyle === 'Receipt' && <ClassicReceipt ref={receiptRef} books={books} userName={userName} bgPosition={bgPosition}/>}
        {receiptStyle === 'Spotify' && <SpotifyStyleReceipt ref={receiptRef} books={books} userName={userName} bgPosition={bgPosition}/>}
      </div>
      <p className="absolute bottom-4 left-4 text-sm text-gray-600">
        Made by{' '}
        <a href="https://kengll.github.io/about" className="hover:underline">Roger Lin</a>
        <br />
        Inspired by{' '}
        <a href="https://receiptify.herokuapp.com/" className="hover:underline">Receiptify</a>{' '}
        made by{' '}
        <a href="https://michellexliu.me/" className="hover:underline">Michelle Liu</a>
      </p>
      <div className="w-1/3 flex flex-col gap-6 text-black font-sans">
        <Controls
          userName={userName}
          setUserName={setUserName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          noResults={noResults}
          handleSearchSelect={handleSearchSelect}
          receiptStyle={receiptStyle}
          setReceiptStyle={setReceiptStyle}
          downloadReceipt={downloadReceipt}
          generatingOrDownloading={generatingOrDownloading}
          debouncedQuery={debouncedQuery}
          randomizeBgPosition={randomizeBgPosition}
        />

        <div className="bg-white p-6 shadow-lg rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold m-0">Track List</h2>
            <button
              onClick={handleClearAll}
              className="px-1.5 py-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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