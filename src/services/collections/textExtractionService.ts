
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Extract text content from uploaded files using OpenAI's processing capabilities
 */
export const extractTextFromFile = async (file: File): Promise<string | null> => {
  try {
    console.log('Extracting text from file:', file.name, 'Type:', file.type);
    
    // Handle different file types
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      return await extractTextFromTextFile(file);
    }
    
    if (file.type === 'text/csv') {
      return await extractTextFromCSVFile(file);
    }
    
    if (file.type === 'application/pdf') {
      return await extractTextFromPDF(file);
    }
    
    if (file.type.startsWith('image/')) {
      return await extractTextFromImage(file);
    }
    
    if (file.type.includes('word') || file.type.includes('document')) {
      // For Word docs, we'll show a message that manual content entry is recommended
      console.log('Word document detected - recommend manual content entry');
      return null;
    }
    
    // For other file types, return null (no extraction available)
    console.log('No text extraction available for file type:', file.type);
    return null;
    
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return null;
  }
};

/**
 * Extract text from plain text files
 */
const extractTextFromTextFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read text file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Extract text from CSV files with basic formatting
 */
const extractTextFromCSVFile = async (file: File): Promise<string> => {
  const rawText = await extractTextFromTextFile(file);
  
  // Convert CSV to a more readable format
  const lines = rawText.split('\n');
  const headers = lines[0]?.split(',') || [];
  
  let formattedText = `CSV Data from ${file.name}\n\n`;
  formattedText += `Headers: ${headers.join(', ')}\n\n`;
  
  // Add first few rows as sample data
  formattedText += 'Sample Data:\n';
  lines.slice(1, Math.min(6, lines.length)).forEach((line, index) => {
    if (line.trim()) {
      formattedText += `Row ${index + 1}: ${line}\n`;
    }
  });
  
  if (lines.length > 6) {
    formattedText += `\n... and ${lines.length - 6} more rows`;
  }
  
  return formattedText;
};

/**
 * Extract text from PDF files by converting to images first
 */
const extractTextFromPDF = async (file: File): Promise<string | null> => {
  try {
    // Set up PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let extractedText = '';
    const maxPages = Math.min(pdf.numPages, 5); // Limit to first 5 pages
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      // Create canvas to render PDF page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      }).promise;
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      // Convert blob to base64 and extract text
      const base64 = await blobToBase64(blob);
      const pageText = await extractTextFromImageData(base64, `${file.name}_page_${pageNum}`);
      
      if (pageText) {
        extractedText += `Page ${pageNum}:\n${pageText}\n\n`;
      }
    }
    
    return extractedText || null;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return null;
  }
};

/**
 * Extract text from images using OpenAI Vision
 */
const extractTextFromImage = async (file: File): Promise<string | null> => {
  try {
    const base64 = await fileToBase64(file);
    return await extractTextFromImageData(base64, file.name);
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return null;
  }
};

/**
 * Extract text from image data using OpenAI Vision
 */
const extractTextFromImageData = async (base64: string, fileName: string): Promise<string | null> => {
  try {
    const response = await fetch('https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/extract-image-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: base64,
        fileName: fileName
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to extract text from image');
    }

    const result = await response.json();
    return result.extractedText || null;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return null;
  }
};

/**
 * Convert file to base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert blob to base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Get recommendations for file types that can't be auto-extracted
 */
export const getExtractionRecommendation = (fileType: string): string | null => {
  if (fileType.includes('word') || fileType.includes('document')) {
    return 'For Word documents, please copy and paste the key content into the Content field to make it available to research participants.';
  }
  
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return 'For Excel files, please summarize the key data in the Content field to make it available to research participants.';
  }
  
  return null;
};
