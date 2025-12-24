'use client';
import { useState, useCallback, RefObject, useEffect } from 'react';
import { toPng } from 'html-to-image';

interface DownloadOptions {
  userName: string;
  receiptStyle: string;
}

/**
 * Custom hook for generating and downloading images from DOM elements
 * @param receiptRef - Reference to the HTML element to convert to image
 * @param dependencies - Array of dependencies that should trigger image regeneration
 * @returns Object containing generation and download functions plus state
 */
export function useImageGenerator<T extends readonly unknown[]>(
  receiptRef: RefObject<HTMLDivElement>,
  dependencies: T
) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatingOrDownloading, setGeneratingOrDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generates an image from the referenced DOM element
   */
  const generateImage = useCallback(async () => {
    if (!receiptRef.current) return;
    try {
      setGeneratingOrDownloading(true);
      setError(null);
      
      // Safari & html-to-image issue workaround
      // https://github.com/bubkoo/html-to-image/issues/361
      await toPng(receiptRef.current);
      await toPng(receiptRef.current);
      const dataUrl = await toPng(receiptRef.current);
      
      setGeneratedImage(dataUrl);
      return dataUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      console.error('Error generating image:', err);
      return null;
    } finally {
      setGeneratingOrDownloading(false);
    }
  }, [receiptRef]);

  // Create a stable key from dependencies so we can watch them without
  // using a spread in dependency arrays (which ESLint can't verify).
  const _depKey = JSON.stringify(dependencies);

  /**
   * Downloads the generated image with a custom filename
   */
  const downloadReceipt = useCallback(({ userName, receiptStyle }: DownloadOptions) => {
    if (!generatedImage) {
      setError('No image generated yet');
      return;
    }
    try {
      setGeneratingOrDownloading(true);
      setError(null);
      
      const link = document.createElement('a');
      link.download = `${userName}-${receiptStyle}.png`;
      link.href = generatedImage;
      link.click();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download image';
      setError(errorMessage);
      console.error('Error downloading image:', err);
    } finally {
      setGeneratingOrDownloading(false);
    }
  }, [generatedImage]);

  // Generate image when dependency values change
  useEffect(() => {
    generateImage();
  }, [generateImage, _depKey]);

  return {
    generateImage,
    downloadReceipt,
    generatedImage,
    generatingOrDownloading,
    error,
  };
}