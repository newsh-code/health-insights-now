import { useState } from 'react';
import { extractTextFromFile, LabMarker } from '@/utils/ocrUtils';
import { supabase } from '@/integrations/supabase/client';
import { UserInfo } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ParsedInsights {
  interpretation: string;
  lifestyle_recommendations: {
    diet: string[];
    exercise: string[];
    sleep: string[];
    stress: string[];
  };
  urgent_flags: string[];
  disclaimer: string;
}

export const useOCRProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedValues, setExtractedValues] = useState<LabMarker[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [parsedInsights, setParsedInsights] = useState<ParsedInsights | null>(null);

  const parseLabMarkersWithAI = async (ocrText: string): Promise<LabMarker[]> => {
    console.log('Parsing OCR text with AI:', ocrText.substring(0, 200) + '...');
    
    const { data, error } = await supabase.functions.invoke('parse-lab-markers', {
      body: { ocrText }
    });

    if (error) {
      console.error('AI parsing error:', error);
      throw new Error(error.message || 'Failed to parse lab markers with AI');
    }

    if (!data?.labMarkers || !Array.isArray(data.labMarkers)) {
      throw new Error('Invalid response from AI parser');
    }

    return data.labMarkers;
  };

  const processFileAndGenerateInsights = async (file: File, userInfo: UserInfo) => {
    setIsProcessing(true);
    setInsights('');
    setParsedInsights(null);
    
    try {
      // Step 1: Extract raw text from file
      console.log('Processing file:', file.name);
      const ocrText = await extractTextFromFile(file);
      console.log('Extracted OCR text length:', ocrText.length);
      
      if (!ocrText || ocrText.trim().length === 0) {
        toast({
          title: "No text found",
          description: "We couldn't extract any text from your file. Please try a clearer image or different file.",
          variant: "destructive",
        });
        return;
      }

      // Step 2: Parse lab markers using AI
      console.log('Parsing lab markers with AI...');
      const aiParsedMarkers = await parseLabMarkersWithAI(ocrText);
      console.log('AI parsed markers:', aiParsedMarkers);
      
      if (aiParsedMarkers.length === 0) {
        toast({
          title: "No valid lab markers found",
          description: "No valid lab markers were identified in your file. Please try a different lab report.",
          variant: "destructive",
        });
        return;
      }
      
      setExtractedValues(aiParsedMarkers);
      
      // Step 3: Generate insights using Supabase Edge Function
      console.log('Generating insights with AI-parsed data:', {
        user_info: userInfo,
        lab_values: aiParsedMarkers
      });
      
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {
          user_info: userInfo,
          lab_values: aiParsedMarkers
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate insights');
      }

      console.log('Received insights response:', data);

      if (data?.insights) {
        // Try to parse as JSON first
        try {
          const parsed = typeof data.insights === 'string' ? JSON.parse(data.insights) : data.insights;
          setParsedInsights(parsed);
          console.log('Parsed insights:', parsed);
        } catch (parseError) {
          // Fallback to string format if JSON parsing fails
          console.log('Failed to parse as JSON, using string format');
          setInsights(data.insights);
        }
        
        toast({
          title: "Analysis complete!",
          description: `Found ${aiParsedMarkers.length} lab markers and generated personalized insights.`,
        });
      } else {
        throw new Error('No insights received from AI');
      }

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    extractedValues,
    insights,
    parsedInsights,
    processFileAndGenerateInsights,
  };
};
