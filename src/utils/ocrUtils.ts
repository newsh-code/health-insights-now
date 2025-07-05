
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface LabMarker {
  name: string;
  value: number;
  unit?: string;
  units?: string; // Keep for backward compatibility
  reference_range?: string;
  status?: 'low' | 'normal' | 'high';
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

export const extractTextFromImage = async (file: File): Promise<string> => {
  const { data: { text } } = await Tesseract.recognize(file, 'eng');
  return text;
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    return await extractTextFromPDF(file);
  } else if (file.type.startsWith('image/')) {
    return await extractTextFromImage(file);
  } else {
    throw new Error('Unsupported file type');
  }
};

// Legacy function - kept for compatibility but no longer used
export const processFile = async (file: File): Promise<LabMarker[]> => {
  const text = await extractTextFromFile(file);
  return []; // No longer parsing locally, AI does this now
};
