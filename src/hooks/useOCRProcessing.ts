import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserInfo, AnalysisResult, LabMarker } from '@/types';
import { toast } from '@/hooks/use-toast';

const SUPPORTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const readAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const useOCRProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedValues, setExtractedValues] = useState<LabMarker[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const parseLabMarkersWithAI = async (base64: string, mediaType: string): Promise<LabMarker[]> => {
    const { data, error } = await supabase.functions.invoke('parse-lab-markers', {
      body: { file: base64, media_type: mediaType },
    });

    if (error) throw new Error(error.message || 'Failed to parse lab markers');
    if (!data?.labMarkers || !Array.isArray(data.labMarkers)) {
      throw new Error('Invalid response from lab marker parser');
    }

    return data.labMarkers;
  };

  const analyzeBloodWork = async (
    labMarkers: LabMarker[],
    userInfo: UserInfo
  ): Promise<AnalysisResult> => {
    const { data, error } = await supabase.functions.invoke('analyze-blood-work', {
      body: { user_info: userInfo, lab_markers: labMarkers },
    });

    if (error) throw new Error(error.message || 'Failed to analyze blood work');
    if (!data?.markers || !Array.isArray(data.markers)) {
      throw new Error('Invalid response from blood work analyzer');
    }

    return data as AnalysisResult;
  };

  const processFileAndGenerateInsights = async (file: File, userInfo: UserInfo) => {
    setIsProcessing(true);
    setAnalysisResult(null);
    setExtractedValues([]);

    try {
      if (!SUPPORTED_TYPES.includes(file.type)) {
        toast({
          title: 'Unsupported file type',
          description: 'Please upload a PDF or an image (JPEG, PNG, WebP).',
          variant: 'destructive',
        });
        return;
      }

      // Step 1: Read file as base64 — no client-side OCR needed
      console.log('Reading file:', file.name, file.type);
      const base64 = await readAsBase64(file);

      // Step 2: Send directly to Claude for extraction
      console.log('Extracting lab markers via Claude...');
      const parsedMarkers = await parseLabMarkersWithAI(base64, file.type);

      if (parsedMarkers.length === 0) {
        toast({
          title: 'No lab markers found',
          description: 'No valid lab markers were identified. Please try a different lab report.',
          variant: 'destructive',
        });
        return;
      }

      setExtractedValues(parsedMarkers);

      // Step 3: Analyse with Claude — per-marker explanations + overall insights
      console.log('Analysing blood work with Claude...');
      const result = await analyzeBloodWork(parsedMarkers, userInfo);
      setAnalysisResult(result);

      toast({
        title: 'Analysis complete!',
        description: `Analysed ${parsedMarkers.length} lab markers with personalised insights.`,
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    extractedValues,
    analysisResult,
    processFileAndGenerateInsights,
  };
};
