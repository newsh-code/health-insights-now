
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface LabMarker {
  name: string;
  value: number;
  units?: string;
  reference_range?: string;
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

export const parseLabValues = (text: string): LabMarker[] => {
  const labMarkers: LabMarker[] = [];
  const lines = text.split('\n');
  
  // Common lab marker patterns
  const patterns = [
    // Pattern: "Vitamin D 25 ng/mL (30-100)"
    /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)?\s*\(([^)]+)\)/g,
    // Pattern: "Cholesterol: 180 mg/dL"
    /(\w+(?:\s+\w+)*):\s*(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)?/g,
    // Pattern: "HDL 45"
    /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)?(?:\s|$)/g
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const name = match[1].trim();
        const value = parseFloat(match[2]);
        const units = match[3]?.trim();
        const reference_range = match[4]?.trim();

        // Filter out common non-lab values
        if (name.length > 2 && !isNaN(value) && value > 0) {
          labMarkers.push({
            name,
            value,
            units,
            reference_range
          });
        }
      }
    }
  }

  return labMarkers;
};

export const processFile = async (file: File): Promise<LabMarker[]> => {
  let text = '';
  
  if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (file.type.startsWith('image/')) {
    text = await extractTextFromImage(file);
  } else {
    throw new Error('Unsupported file type');
  }

  return parseLabValues(text);
};
