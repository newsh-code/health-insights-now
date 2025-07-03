
import { useState } from 'react';
import { processFile, LabMarker } from '@/utils/ocrUtils';
import { supabase } from '@/integrations/supabase/client';
import { UserInfo } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useOCRProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedValues, setExtractedValues] = useState<LabMarker[]>([]);
  const [insights, setInsights] = useState<string>('');

  const processFileAndGenerateInsights = async (file: File, userInfo: UserInfo) => {
    setIsProcessing(true);
    setInsights('');
    
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

      setExtractedValues(labValues);
      
      // Step 2: Generate insights using Supabase Edge Function
      console.log('Generating insights with payload:', {
        user_info: userInfo,
        lab_values: labValues
      });
      
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {
          user_info: userInfo,
          lab_values: labValues
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate insights');
      }

      console.log('Received insights response:', data);

      if (data?.insights) {
        setInsights(data.insights);
        toast({
          title: "Analysis complete!",
          description: `Found ${labValues.length} lab markers and generated personalized insights.`,
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
    processFileAndGenerateInsights,
  };
};
