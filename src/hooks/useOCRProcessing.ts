import { useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/integrations/supabase/client';
import { UserInfo, AnalysisResult, LabMarker } from '@/types';
import { toast } from '@/hooks/use-toast';

const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;

const authHeaders = {
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY,
};

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
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearUploadError = () => setUploadError(null);

  const parseLabMarkersWithAI = async (file: File): Promise<LabMarker[]> => {
    console.log('[parseLabMarkersWithAI] Reading file as base64...');
    const base64 = await readAsBase64(file);
    console.log('[parseLabMarkersWithAI] base64 length:', base64.length, '| media_type:', file.type);

    const url = `${FUNCTIONS_BASE}/parse-lab-markers`;
    console.log('[parseLabMarkersWithAI] POSTing to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: base64, media_type: file.type }),
    });

    console.log('[parseLabMarkersWithAI] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[parseLabMarkersWithAI] Error response body:', errorText);

      // Surface structured error from server as a clean user-facing message
      if (response.status === 422) {
        let errorData: { error?: string; message?: string } | null = null;
        try { errorData = JSON.parse(errorText); } catch { /* ignore */ }
        if (errorData?.error === 'no_lab_markers') {
          throw new Error(errorData.message ?? "We couldn't find any lab markers in this file.");
        }
      }

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
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
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
    setUploadError(null);

    try {
      console.log('[processFile] Starting:', file.name, file.type, file.size, 'bytes');
      const parsedMarkers = await parseLabMarkersWithAI(file);

      setExtractedValues(parsedMarkers);

      const result = await analyzeBloodWork(parsedMarkers, userInfo);
      setAnalysisResult(result);

      toast({
        title: 'Analysis complete!',
        description: `Analysed ${parsedMarkers.length} lab markers with personalised insights.`,
      });
    } catch (error) {
      console.error('[processFile] Error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setUploadError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    extractedValues,
    analysisResult,
    uploadError,
    clearUploadError,
    processFileAndGenerateInsights,
  };
};
