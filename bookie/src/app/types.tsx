export interface Book {
    id: string;
    title: string;
    author: string;
    genre: string;
    publishYear: number;
    pages: number;
    isbn?: string;
    coverUrl?: string;
  }

export interface ReceiptProps {
    books: Book[];
    userName: string;
    bgPosition: { x: number; y: number };
  }