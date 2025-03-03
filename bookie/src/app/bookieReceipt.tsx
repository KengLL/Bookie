'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image'; // You'll need to install this package

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

interface BookieReceiptProps {
  books: Book[];
  userName?: string;
}

const BookieReceipt = ({ books, userName = "Book addict" }: BookieReceiptProps) => {
  const [timeFrame, setTimeFrame] = useState<'month' | 'sixMonths' | 'allTime'>('month');
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const orderNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const totalReadingTime = books.length * 5; // Assuming 5 hours per book as an example
  
  const downloadReceipt = async () => {
    if (receiptRef.current) {
      try {
        const dataUrl = await toPng(receiptRef.current);
        const link = document.createElement('a');
        link.download = `bookie-receipt-${timeFrame}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  const getPeriodLabel = () => {
    switch (timeFrame) {
      case 'month': return 'MONTHLY READING LIST';
      case 'sixMonths': return 'SEMI-ANNUAL READING LIST';
      case 'allTime': return 'ALL-TIME READING LIST';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 space-x-2">
        <button 
          onClick={() => setTimeFrame('month')} 
          className={`px-4 py-2 rounded ${timeFrame === 'month' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          This Month
        </button>
        <button 
          onClick={() => setTimeFrame('sixMonths')} 
          className={`px-4 py-2 rounded ${timeFrame === 'sixMonths' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          Last 6 Months
        </button>
        <button 
          onClick={() => setTimeFrame('allTime')} 
          className={`px-4 py-2 rounded ${timeFrame === 'allTime' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          All Time
        </button>
      </div>
      
      <div 
        ref={receiptRef} 
        className="w-full max-w-md bg-[#faf6eb] p-6 shadow-lg rounded-lg border-2 border-dashed border-gray-300 
                  bg-[url('/images/paper-texture1.jpg')] bg-cover bg-center relative"
        style={{
          // Add these styles to recreate the paper receipt look
          minHeight: '85vh',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black tracking-wider text-gray-800 mb-1">BOOKIE</h1>
          <p className="text-sm text-gray-600 uppercase tracking-wider font-semibold">{getPeriodLabel()}</p>
        </div>
        
        <p className="text-center text-sm text-gray-600 mb-4">
          ORDER #{orderNumber} FOR {userName.toUpperCase()}
        </p>
        <p className="text-center text-sm text-gray-600 mb-6">
          {formattedDate}
        </p>
        
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-gray-400">
              <th className="text-left pl-2 py-1 w-8">#</th>
              <th className="text-left py-1">TITLE</th>
              <th className="text-right pr-2 py-1 w-16">HRS</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr key={book.id} className="border-b border-gray-300">
                <td className="pl-2 py-2 align-top">{index + 1}</td>
                <td className="py-2">
                  <div className="font-medium">{book.title}</div>
                  <div className="text-sm text-gray-600">{book.author}</div>
                  <div className="text-xs text-red-600 uppercase">{book.genre}</div>
                </td>
                <td className="text-right pr-2 py-2 align-top">5.0</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-400 font-medium">
              <td colSpan={2} className="pl-2 py-2 text-left">ITEM COUNT:</td>
              <td className="pr-2 py-2 text-right">{books.length}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={2} className="pl-2 py-2 text-left">TOTAL:</td>
              <td className="pr-2 py-2 text-right">{totalReadingTime}.0</td>
            </tr>
          </tfoot>
        </table>
        
        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <p>CARD #: **** **** **** {new Date().getFullYear()}</p>
          <p>AUTH CODE: {Math.floor(Math.random() * 1000000)}</p>
          <p>CARDHOLDER: {userName.toUpperCase()}</p>
        </div>
        
        <div className="text-center space-y-2 mt-8">
          <p className="font-medium">WARNING! Reading could be addictive </p>
          <div className="flex justify-center">
            {/* Barcode placeholder - you can use an actual barcode library here */}
            {/* <div className="h-10 w-48 bg-gradient-to-r from-black via-gray-800 to-black"></div> */}
          </div>
          <p className="text-xs">bookie.com</p>
        </div>
      </div>
      
      <button 
        onClick={downloadReceipt} 
        className="mt-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Download Receipt
      </button>
    </div>
  );
};

export default BookieReceipt;