'use client';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface ImageDropboxProps {
  onImageSelect: (file: File, dataUrl: string) => void;
  currentImage: string | null;
  isProcessingImage: boolean;
}

const ImageDropbox: React.FC<ImageDropboxProps> = ({ onImageSelect, currentImage, isProcessingImage }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        onImageSelect(file, dataUrl);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Upload Image of Books
      </h3>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'}`}
      >
        <input {...getInputProps()} />
        
        {previewUrl ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full h-40 mb-2">
              <Image 
                src={previewUrl} 
                alt="Uploaded books" 
                fill
                style={{ objectFit: 'contain' }}
                className="rounded"
              />
            </div>
            <p className="text-sm text-gray-500">
              {isUploading || isProcessingImage ? 'Processing image...' : 'Drop a new image, or click to change'}
            </p>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-gray-700">
              {isDragActive ? 'Drop your image here' : 'Upload a photo of your books for analysis'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              We&apos;ll try to identify book titles in your image
            </p> 
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDropbox;