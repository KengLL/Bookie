import { Book } from './components/types';

interface ReceiptContentProps {
  books: Book[];
  userName: string;
  receiptData: {
    date: string;
    orderNumber: string;
    authCode: string;
  };
  totalReadingTime: number;
}

export const ReceiptContent = ({ books, userName, receiptData, totalReadingTime }: ReceiptContentProps) => (
  <>
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
      <p className="font-medium">WARNING! READING CAN BE ADDICTIVE</p>
      <div className="flex justify-center">
        {/* Barcode placeholder */}
      </div>
      <p className="text-xs">localbookie.vercel.app</p>
    </div>
  </>
);