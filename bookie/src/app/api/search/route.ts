import { NextResponse } from 'next/server';
import { GBItem } from '@/app/components/types';
import { Book } from '@/app/components/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  let results: Book[] = [];

  // Google Books
    try {
      const gbEndpoint = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;
      const gbResponse = await fetch(gbEndpoint);
      const gbData = await gbResponse.json();

      if (gbData.items?.length > 0) {
        results = gbData.items.slice(0, 5).map((item: GBItem) => ({
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.join(', ') || 'Unknown',
          genre: item.volumeInfo.categories?.[0] || 'General',
          publishYear: parseInt(item.volumeInfo.publishedDate?.substring(0, 4) || "0") || new Date().getFullYear(),
          isbn: item.volumeInfo.industryIdentifiers?.find((id) => id.type === 'ISBN_13')?.identifier,
          pages: item.volumeInfo.pageCount,
          coverUrl: item.volumeInfo.imageLinks?.thumbnail || '/images/enchanted_book.jpg'
        }));
      }
    } catch (error) {
      console.error('Error fetching from Google Books:', error);
    }
  //}

  return NextResponse.json({ results });
}
