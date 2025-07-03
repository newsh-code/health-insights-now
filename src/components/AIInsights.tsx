
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertTriangle } from 'lucide-react';

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
  if (!insights) return null;

  return (
    <div className="space-y-4">
      {/* Extracted Values Summary */}
      {extractedValues.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Extracted Lab Values ({extractedValues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {extractedValues.slice(0, 6).map((marker, index) => (
                <div key={index} className="flex justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{marker.name}</span>
                  <span>
                    {marker.value} {marker.units}
                    {marker.reference_range && (
                      <span className="text-gray-500 ml-1">({marker.reference_range})</span>
                    )}
                  </span>
                </div>
              ))}
              {extractedValues.length > 6 && (
                <div className="text-gray-500 text-center col-span-full">
                  ... and {extractedValues.length - 6} more values
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Generated Insights */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-600" />
            AI Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {insights}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              <strong>Privacy Note:</strong> Your file was processed locally and is not stored on our servers. 
              This analysis is for educational purposes only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
