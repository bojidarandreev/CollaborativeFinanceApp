"use client"

import React, { useRef, useState } from 'react';
import { Button } from '../ui/button';
import FileImportDialog from './FileImportDialog';

const FileImportButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsDialogOpen(true);
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
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
      <Button onClick={handleButtonClick}>Import from File</Button>
      {selectedFile && (
        <FileImportDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          file={selectedFile}
        />
      )}
    </>
  );
};

export default FileImportButton;
