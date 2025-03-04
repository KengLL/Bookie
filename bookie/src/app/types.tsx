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

export interface OLDoc {
    title: string;
    author_name?: string[];
    subject?: string[];
    first_publish_year?: number;
    publish_year?: number[];
    number_of_pages?: number;
    isbn?: string[];
    cover_i?: number;
  }

export interface IndustryIdentifier {
    type: string;
    identifier: string;
  }
  
export interface GBItem {
    volumeInfo: {
      title: string;
      authors?: string[];
      categories?: string[];
      publishedDate?: string;
      industryIdentifiers?: IndustryIdentifier[];
      pageCount?: number;
      imageLinks?: {
        thumbnail?: string;
      };
    };
  }
