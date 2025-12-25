'use client';
import { forwardRef, useEffect, useState } from 'react';
import { ReceiptProps } from '../components/types';
import "./classic.css";

const ClassicReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ books, userName, bgPosition }, ref) => {
  const [receiptData, setReceiptData] = useState({
    date: '',
    orderNumber: '000',
    authCode: '000000'
  });

  const totalAmount = books.reduce((sum, book) => sum + (book.pages / 100), 0).toFixed(2);

  useEffect(() => {
    const img = new Image();
    img.src = '/images/paper-texture1.jpg';
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).toUpperCase(); // Ensures full uppercase format
    
    setReceiptData({
      date: formattedDate,
      orderNumber: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      authCode: Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    });
  }, []);
  
  return (
    <div className="receipt-container flex flex-col items-center">
      <div 
        ref={ref}
        className="w-[340px] p-5 shadow-lg uppercase relative"
        style={{ 
          fontFamily: 'MerchantCopy, Anonymous Pro, Courier New, Courier, monospace',
          backgroundImage: 'url(/images/paper-texture1.jpg)',
          backgroundPosition: `${bgPosition.x}% ${bgPosition.y}%`, 
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="hidden">
          <img src="/images/paper-texture1.jpg" alt="preloader" />
          <img src="/images/barcode.png" alt="preloader" />
        </div>

        <h2 className="text-[3.3em] text-center font-[600] mt-4 mb-4"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>
          RECEIPT
        </h2>

        <p className="font-receipt text-[2em] -mb-3 leading-[2rem]">
          ORDER #000{receiptData.orderNumber} FOR {userName}
        </p>

        <p className="text-[2em] leading-[1.5em] -mt-3">
          {receiptData.date}
        </p>
        
        <table className="w-full font-receipt text-[2em]  leading-5">
          <thead>
            <tr className="border-y border-dashed">
              <td>QTY</td>
              <td>ITEM</td>
              <td>AMT</td>
            </tr>
          </thead>
          
          <tbody>
            {books.map((book, index) => (
              <tr key={book.id}>
                <td className="pl-0">{(index + 1).toString().padStart(2, '0')}</td>
                <td className="max-w-[225px] overflow-auto">
                  {book.title} - {book.author}
                </td>
                <td className="text-right pr-0">{(book.pages / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t border-dashed">
              <td colSpan={2}>ITEM COUNT:</td>
              <td className="text-right">{books.length}</td>
            </tr>
            <tr className="border-b border-dashed">
              <td colSpan={2}>TOTAL:</td>
              <td className="text-right">{totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-2 font-receipt text-[2em] leading-5">
          <p>CARD #: **** **** **** 2025</p>
          <p>AUTH CODE: {receiptData.authCode}</p>
          <p>CARDHOLDER: {userName}</p>
        </div>

        <div className="text-center mt-4">
          <p className="text-[2em] leading-5 font-['Helvetica', 'Geneva', 'Tahoma', 'sans-serif';] mb-2">THANK YOU FOR VISITING!</p>
          <img
            src="/images/barcode.png"
            alt="Barcode"
            className="w-[70%] h-auto max-w-[210px] mx-auto block"
          />
          <p className="font-receipt text-[2em] lowercase leading-5">localbookie.vercel.app</p>
        </div>
      </div>
    </div>
  );
});

ClassicReceipt.displayName = 'ClassicReceipt';
export default ClassicReceipt;