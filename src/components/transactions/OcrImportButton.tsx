"use client"

import React, { useRef, useState } from 'react';
import { Button } from '../ui/button';
// I will create this component next
import OcrImportDialog from './OcrImportDialog';

const OcrImportButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setIsDialogOpen(true);
    } else {
      alert("Please select a valid image file.");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Button onClick={handleButtonClick} variant="outline">Scan Receipt</Button>
      {selectedImage && (
        <OcrImportDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          file={selectedImage}
        />
      )}
    </>
  );
};

export default OcrImportButton;
