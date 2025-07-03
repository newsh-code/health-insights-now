
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { LabMarkersCard } from './LabMarkersCard';
import { AIInsightsCard } from './AIInsightsCard';

interface AIInsightsProps {
  insights: string;
  extractedValues: Array<{
    name: string;
    value: number;
    units?: string;
    reference_range?: string;
  }>;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights, extractedValues }) => {
  if (!insights && extractedValues.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Personalized Health Insights</h2>
        <p className="text-gray-600">Based on your lab results</p>
      </div>

      {/* Lab Markers */}
      {extractedValues.length > 0 && (
        <LabMarkersCard extractedValues={extractedValues} />
      )}

      {/* AI Generated Insights */}
      {insights && (
        <AIInsightsCard insights={insights} />
      )}

      {/* Medical Disclaimer */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Medical Disclaimer:</p>
              <p>
                This analysis is for educational purposes only and is not a substitute for professional medical advice. 
                Always consult with your healthcare provider before making any changes to your health routine.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
