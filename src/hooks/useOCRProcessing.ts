import { useState } from 'react';
import { processFile, LabMarker } from '@/utils/ocrUtils';
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

  const filterLabMarkers = (markers: LabMarker[]): LabMarker[] => {
    return markers.filter(marker => {
      const name = marker.name.toLowerCase();
      const value = String(marker.value);
      
      // Exclude entries with date-related keywords
      if (name.includes('date') || name.includes('reference') || 
          name.includes('received') || name.includes('collected')) {
        return false;
      }
      
      // Exclude entries that look like raw date strings
      if (/^\d{4}\s+\d{1,2}$/.test(value) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
        return false;
      }
      
      // Exclude metadata entries without units
      if (!marker.units && (name.includes('report') || name.includes('age') || 
          name.includes('patient') || name.includes('id'))) {
        return false;
      }
      
      // Keep entries that have numeric values with units (true physiological markers)
      return true;
    });
  };

  const processFileAndGenerateInsights = async (file: File, userInfo: UserInfo) => {
    setIsProcessing(true);
    setInsights('');
    setParsedInsights(null);
    
    try {
      // Step 1: Extract text and parse lab values
      console.log('Processing file:', file.name);
      const labValues = await processFile(file);
      console.log('Extracted lab values:', labValues);
      
      if (labValues.length === 0) {
        toast({
          title: "No lab values found",
          description: "We couldn't extract any lab values from your file. Please try a clearer image or different file.",
          variant: "destructive",
        });
        return;
      }

      // Filter out non-marker data
      const filteredLabValues = filterLabMarkers(labValues);
      console.log('Filtered lab values:', filteredLabValues);
      
      setExtractedValues(filteredLabValues);
      
      // Step 2: Generate insights using Supabase Edge Function
      console.log('Generating insights with payload:', {
        user_info: userInfo,
        lab_values: filteredLabValues
      });
      
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {
          user_info: userInfo,
          lab_values: filteredLabValues
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
          description: `Found ${filteredLabValues.length} lab markers and generated personalized insights.`,
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
