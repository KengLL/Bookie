import { NextResponse } from 'next/server';
import { GBItem, OLDoc } from '@/app/components/types';
import { Book } from '@/app/components/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  let results: Book[] = [];

  // Helper: Check if the query is a valid ISBN
  const isValidISBN = (q: string) => {
    const cleaned = q.replace(/-/g, '');
    return cleaned.length === 10 || cleaned.length === 13;
  };

  // Open Library search
  try {
    const olEndpoint = `https://openlibrary.org/search.json?${isValidISBN(query) ? `isbn=${query}` : `title=${encodeURIComponent(query)}`}`;
    const olResponse = await fetch(olEndpoint);
    const olData = await olResponse.json();

    if (olData.docs?.length > 0) {
      results = olData.docs.slice(0, 5).map((doc: OLDoc) => ({
        title: doc.title,
        author: doc.author_name?.join(', ') || 'Unknown',
        genre: doc.subject?.slice(0, 2).join(', ') || 'General',
        publishYear: doc.first_publish_year || (doc.publish_year ? doc.publish_year[0] : new Date().getFullYear()),
        pages: doc.number_of_pages || 199,
        isbn: doc.isbn?.[0],
        coverUrl: doc.cover_i 
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : '/images/enchanted_book.jpg'
      }));
    }
  } catch (error) {
    console.error('Error fetching from Open Library:', error);
  }

  // Google Books fallback
  if (results.length === 0) {
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
  }

  return NextResponse.json({ results });
}
