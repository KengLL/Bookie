'use client';
import { forwardRef, useEffect, useState } from 'react';
import { Book } from './types';
import { receiptStyles } from './receiptStyles';

interface BookieReceiptProps {
  books: Book[];
  userName?: string;
  receiptStyle?: 'Bookie' | 'Receipt' | 'Spotify';
}

const BookieReceipt = forwardRef<HTMLDivElement, BookieReceiptProps>(({ 
    books, 
    userName = "Book addict", 
    receiptStyle = 'Receipt' 
  }, ref) => {

  const [receiptData, setReceiptData] = useState({
    date: '',
    orderNumber: '000',
    authCode: '000000'
  });

  const totalReadingTime = books.length * 5; // Assuming 5 hours per book as an example
  
  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    setReceiptData({
      date: formattedDate,
      orderNumber: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      authCode: Math.floor(Math.random() * 1000000).toString()
    });
  }, []);

  const getPeriodLabel = () => {
    switch (receiptStyle) {
      case 'Bookie': return 'BETSLIP';
      case 'Receipt': return 'RECEIPT';
      case 'Spotify': return 'SPOTIFY';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={ref} 
        className={`w-full max-w-md p-6 shadow-lg rounded-lg ${receiptStyles[receiptStyle].container}`}
        style={{
          // Add these styles to recreate the paper receipt look
          minHeight: '85vh',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="text-center mb-6">
          <h1 className={`${receiptStyles[receiptStyle].header} mb-1`}>BOOKIE</h1>
          <p className={receiptStyles[receiptStyle].periodLabel}>{getPeriodLabel()}</p>
        </div>
        
        <p className="text-center text-sm text-gray-600 mb-4">
          ORDER #{receiptData.orderNumber} FOR {userName.toUpperCase()}
        </p>
        <p className="text-center text-sm text-gray-600 mb-6">
          {receiptData.date}
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
          <p>AUTH CODE: {receiptData.authCode}</p>
          <p>CARDHOLDER: {userName.toUpperCase()}</p>
        </div>
        
        <div className="text-center space-y-2 mt-8">
          <p className="font-medium">WARNING! READING CAN BE ADDICTIVE </p>
          <div className="flex justify-center">
            {/* Barcode placeholder - you can use an actual barcode library here */}
            {/* <div className="h-10 w-48 bg-gradient-to-r from-black via-gray-800 to-black"></div> */}
          </div>
          <p className="text-xs">bookie.com</p>
        </div>
      </div>
    </div>
  );
});

BookieReceipt.displayName = 'BookieReceipt';

export default BookieReceipt;