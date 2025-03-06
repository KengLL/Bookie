//'src/app/page.tsx'
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove} from '@dnd-kit/sortable';
import Controls from './components/controls';
import TrackList from './components/trackList';
import { Book } from './components/types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useImageGenerator } from './hooks/useImageGenerator';
import BookieStyleReceipt from './receipt_style/bookie_style';
import ClassicReceipt from './receipt_style/classic_style';
import SpotifyStyleReceipt from './receipt_style/wrapped_style';

export default function Home() {
  // Device detection
  const [isMobile, setIsMobile] = useState(false);

  // User data and preferences
  const [userName, setUserName] = useLocalStorage('userName', 'Bookworm');
  const [bgPosition, setBgPosition] = useState({ x: 50, y: 50 });
  const [receiptStyle, setReceiptStyle] = useState<'Bookie' | 'Receipt' | 'Spotify'>('Receipt');

  // Book list management
  const [books, setBooks] = useLocalStorage<Book[]>('books', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  // Image generation state
  const receiptRef = useRef<HTMLDivElement>(null!);

  const {
    downloadReceipt,
    generatingOrDownloading,
  } = useImageGenerator(receiptRef, [userName, books, receiptStyle]);

  const [activeTab, setActiveTab] = useState<'controls' | 'preview'>('controls');

  // Responsive layout detection
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 932);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle receipt download
  const handleDownload = () => {
    downloadReceipt({ userName, receiptStyle });
  };

  // Book Search functionality
  const searchBooks = useCallback(async (query: string) => {
    if (!query) return;
  
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results: Book[] = data.results || [];
      setSearchResults(results);
      setNoResults(results.length === 0);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
      setNoResults(true);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  useEffect(() => {
    if (debouncedQuery) {
      searchBooks(debouncedQuery);
    }
  }, [debouncedQuery, searchBooks]);

  // Event handlers
  const handleSearchSelect = (book: Book) => {
    setBooks(prev => [...prev, { ...book, id: Date.now().toString() }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  const handleClearAll = () => {
    setBooks([]);
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
  };

  const randomizeBgPosition = () => {
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    setBgPosition({ x, y });
  };

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
                  onClick={handleDownload}
                  disabled={generatingOrDownloading}
                  className="px-4 py-2 w-80 bg-red-600 text-white rounded font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-700"
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
          downloadReceipt={handleDownload}
          generatingOrDownloading={generatingOrDownloading}
          debouncedQuery={debouncedQuery}
          randomizeBgPosition={randomizeBgPosition}
        />
        <TrackList
              books={books}
              onRemove={handleRemoveBook}
              onDragEnd={handleDragEnd}
              onClearAll={handleClearAll}
        />
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
          downloadReceipt={handleDownload}
          generatingOrDownloading={generatingOrDownloading}
          debouncedQuery={debouncedQuery}
          randomizeBgPosition={randomizeBgPosition}
        />

        <TrackList
            books={books}
            onRemove={handleRemoveBook}
            onDragEnd={handleDragEnd}
            onClearAll={handleClearAll}
        />
      </div>
    </div>
  );
}