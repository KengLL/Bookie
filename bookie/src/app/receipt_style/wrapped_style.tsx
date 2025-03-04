'use client';
import { forwardRef, useEffect, useState } from 'react';
import { Book, ReceiptProps } from '../types';
import { ReceiptContent } from '../receiptContent';

const SpotifyStyleReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ books, userName }, ref) => {
    const [receiptData, setReceiptData] = useState({
        date: '',
        orderNumber: '000',
        authCode: '000000'
      });
    
      const totalReadingTime = books.length * 5;
    
      useEffect(() => {
        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        setReceiptData({
          date: formattedDate,
          orderNumber: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
          authCode: Math.floor(Math.random() * 1000000).toString()
        });
    }, []);

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={ref} 
        className="w-full max-w-md bg-green-100 p-6 shadow-lg rounded-lg"
        style={{ minHeight: '85vh', boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)' }}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-600 mb-1">SPOTIFY READS</h1>
          <p className="text-sm text-green-700 uppercase tracking-wider font-semibold">PLAYLIST</p>
        </div>

        <ReceiptContent books={books} userName={userName} receiptData={receiptData} totalReadingTime={totalReadingTime} />
      </div>
    </div>
  );
});

SpotifyStyleReceipt.displayName = 'SpotifyStyleReceipt';
export default SpotifyStyleReceipt;