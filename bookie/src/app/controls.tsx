'use client';
import { Book } from './types';
import Image from 'next/image';

interface ControlsProps {
  userName: string;
  setUserName: (name: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Book[];
  isSearching: boolean;
  noResults: boolean;
  handleSearchSelect: (book: Book) => void;
  receiptStyle: 'Bookie' | 'Receipt' | 'Spotify';
  setReceiptStyle: (style: 'Bookie' | 'Receipt' | 'Spotify') => void;
  downloadReceipt: () => void;
  generatingOrDownloading: boolean;
  debouncedQuery: string;
  randomizeBgPosition: () => void; 
}

export default function Controls({
  userName,
  setUserName,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  noResults,
  handleSearchSelect,
  receiptStyle,
  setReceiptStyle,
  downloadReceipt,
  generatingOrDownloading,
  debouncedQuery,
  randomizeBgPosition
}: ControlsProps) {
  return (
    <>
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

          {isSearching && <div className="text-sm text-black mt-2">Searching...</div>}
          
          {searchResults.length > 0 && (
            <div className="absolute top-12 w-full bg-white border rounded shadow-lg z-10">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSearchSelect(result)}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b flex items-center"
                >
                  <div className="w-[75px] h-[100px] flex justify-center items-center overflow-hidden mr-4">
                  <Image 
                      src={result.coverUrl || "/images/enchanted_book.jpg"} // Fallback image
                      alt={result.title || "Enchanted Book"}
                      width={75} 
                      height={100} 
                      className="book-cover"
                      onError={(e) => {
                        // Fallback to the enchanted book image if the URL fails
                        e.currentTarget.src = "/images/enchanted_book.jpg";
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold mb-1">Customization</h2>
          <div>
            <button 
              onClick={randomizeBgPosition}
              className="px-1.5 py-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Refresh Texture
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="py-2 mb-2 space-x-2">
        <button 
            onClick={() => setReceiptStyle('Receipt')} 
            className={`px-4 py-2 rounded ${receiptStyle === 'Receipt' ? 'bg-[#DCDCC6] text-black' : 'bg-gray-200 text-black'}`}
          >
            Receipt
          </button>
          <button 
            //onClick={() => setReceiptStyle('Bookie')} 
            className={`px-4 py-2 rounded ${receiptStyle === 'Bookie' ? 'bg-[#CA9559] text-white' : 'bg-gray-200 text-black'}`}
          >
            Bookie (Coming Soon)
          </button>
          <button 
            //onClick={() => setReceiptStyle('Spotify')} 
            className={`px-4 py-2 rounded ${receiptStyle === 'Spotify' ? 'bg-[#1DB954] text-white' : 'bg-gray-200'}`}
          >
            Spotify (Coming Soon)
          </button>
        </div>
        <button 
          onClick={downloadReceipt}
          disabled={generatingOrDownloading}
          className={`w-full mt-2 px-6 py-2 bg-red-600 text-white rounded transition-colors ${
            generatingOrDownloading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
          }`}
        >
          {generatingOrDownloading ? 'Generating...' : 'Download Receipt'}
        </button>
      </div>
    </>
  );
}