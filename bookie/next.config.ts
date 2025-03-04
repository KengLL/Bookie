import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

module.exports = {
  images: {
    domains: [
      'covers.openlibrary.org', // Open Library covers
      'books.google.com',      // Google Books covers
      'lh3.googleusercontent.com', // Google Books thumbnail domain
    ],
  },
};