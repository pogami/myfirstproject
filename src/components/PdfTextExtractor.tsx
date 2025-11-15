"use client";

import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs-dist worker for client-side use
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfTextExtractor() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus("Reading PDF...");
    const arrayBuffer = await file.arrayBuffer();

    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";
      let needsOCR = false;

      // First, try regular text extraction
      for (let i = 1; i <= pdf.numPages; i++) {
        setStatus(`Extracting text from page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        extractedText += pageText + "\n";
        
        // If page has very little text, it might be scanned/handwritten
        if (pageText.trim().length < 50) {
          needsOCR = true;
        }
      }

      // If text extraction returned little content, use OCR for scanned/handwritten PDFs
      if (needsOCR || extractedText.trim().length < 100) {
        setStatus("Detected scanned/handwritten PDF. Using OCR...");
        
        // Import Tesseract.js for OCR
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng', 1, {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setStatus(`OCR: Page ${m.page || '?'} (${Math.round(m.progress * 100)}%)`);
            }
          }
        });
        
        let ocrText = "";
        
        // Convert each PDF page to image and OCR it
        for (let i = 1; i <= pdf.numPages; i++) {
          setStatus(`OCR: Processing page ${i}/${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // Higher scale = better OCR accuracy
          
          // Create canvas to render PDF page
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Could not get canvas context for OCR');
          }
          
          // Render PDF page to canvas
          await page.render({ canvasContext: context as any, viewport: viewport }).promise;
          
          // Convert canvas to image data for OCR
          const imageData = canvas.toDataURL('image/png');
          const { data: { text } } = await worker.recognize(imageData);
          
          if (text && text.trim().length > 0) {
            ocrText += `--- Page ${i} ---\n${text.trim()}\n\n`;
          }
        }
        
        await worker.terminate();
        
        // Use OCR text if it's better than extracted text
        if (ocrText.trim().length > extractedText.trim().length) {
          extractedText = ocrText;
          setStatus("OCR extraction complete!");
        } else {
          setStatus("Text extraction complete!");
        }
      } else {
        setStatus("Text extraction complete!");
      }

      setText(extractedText);
    } catch (err) {
      console.error("Error reading PDF:", err);
      setText("Failed to extract text from PDF.");
      setStatus("Error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-md max-w-xl mx-auto">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFile}
        className="mb-4"
      />
      {loading ? (
        <div>
          <p className="mb-2">{status || "Extracting text..."}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '50%' }}></div>
          </div>
        </div>
      ) : (
        <div>
          {status && <p className="mb-2 text-sm text-gray-600">{status}</p>}
          <textarea
            value={text}
            readOnly
            className="w-full h-64 p-2 border rounded"
            placeholder="Extracted text will appear here..."
          />
        </div>
      )}
    </div>
  );
}

