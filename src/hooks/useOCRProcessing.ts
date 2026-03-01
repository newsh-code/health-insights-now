import { useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/integrations/supabase/client';
import { UserInfo, AnalysisResult, LabMarker } from '@/types';
import { toast } from '@/hooks/use-toast';

const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;

// Common headers for every edge-function call.
// Using both Authorization and apikey mirrors what the Supabase client
// sends, ensuring the gateway accepts the request regardless of format.
const authHeaders = {
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY,
};

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

  const parseLabMarkersWithAI = async (file: File): Promise<LabMarker[]> => {
    console.log('[parseLabMarkersWithAI] Reading file as base64...');
    const base64 = await readAsBase64(file);
    console.log('[parseLabMarkersWithAI] base64 length:', base64.length, '| media_type:', file.type);

    const url = `${FUNCTIONS_BASE}/parse-lab-markers`;
    console.log('[parseLabMarkersWithAI] POSTing to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: base64, media_type: file.type }),
    });

    console.log('[parseLabMarkersWithAI] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[parseLabMarkersWithAI] Error response body:', errorText);
      throw new Error(`parse-lab-markers failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('[parseLabMarkersWithAI] Received labMarkers count:', data?.labMarkers?.length);

    if (!data?.labMarkers || !Array.isArray(data.labMarkers)) {
      throw new Error('Invalid response from lab marker parser');
    }

    return data.labMarkers;
  };

  const analyzeBloodWork = async (
    labMarkers: LabMarker[],
    userInfo: UserInfo
  ): Promise<AnalysisResult> => {
    const url = `${FUNCTIONS_BASE}/analyze-blood-work`;
    console.log('[analyzeBloodWork] POSTing to:', url, '| markers:', labMarkers.length);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_info: userInfo, lab_markers: labMarkers }),
    });

    console.log('[analyzeBloodWork] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[analyzeBloodWork] Error response body:', errorText);
      throw new Error(`analyze-blood-work failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();

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

      console.log('[processFile] Starting:', file.name, file.type, file.size, 'bytes');
      const parsedMarkers = await parseLabMarkersWithAI(file);

      if (parsedMarkers.length === 0) {
        toast({
          title: 'No lab markers found',
          description: 'No valid lab markers were identified. Please try a different lab report.',
          variant: 'destructive',
        });
        return;
      }

      setExtractedValues(parsedMarkers);

      const result = await analyzeBloodWork(parsedMarkers, userInfo);
      setAnalysisResult(result);

      toast({
        title: 'Analysis complete!',
        description: `Analysed ${parsedMarkers.length} lab markers with personalised insights.`,
      });
    } catch (error) {
      console.error('[processFile] Error:', error);
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
