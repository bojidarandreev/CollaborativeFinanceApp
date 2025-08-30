"use client"

import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from '../ui/button';
import { Progress } from '../ui/progress'; // I'll need to add this component

interface OcrImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

const OcrImportDialog: React.FC<OcrImportDialogProps> = ({ isOpen, onClose, file }) => {
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (file && isOpen) {
      handleOcr(file);
    }
  }, [file, isOpen]);

  const handleOcr = async (imageFile: File) => {
    setStatus('recognizing');
    setOcrProgress(0);
    setOcrText('');

    const { data: { text } } = await Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
          console.log(m)
        },
      }
    );

    setOcrText(text);
    setStatus('done');
    // TODO: Add logic to parse the text and pre-fill a form
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Scan Receipt</DialogTitle>
        </DialogHeader>
        <div>
          {status === 'recognizing' && (
            <div>
              <p>Scanning receipt... {ocrProgress}%</p>
              <Progress value={ocrProgress} className="w-full" />
            </div>
          )}
          {status === 'done' && (
            <div>
              <h3 className="font-bold">Extracted Text</h3>
              <textarea
                className="w-full h-48 p-2 border rounded-md"
                value={ocrText}
                readOnly
              />
              {/* TODO: Add transaction form pre-filled with parsed data */}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={status !== 'done'}>Create Transaction</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OcrImportDialog;
