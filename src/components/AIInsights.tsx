import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, AlertCircle, HeartPulse } from 'lucide-react';

interface StructuredInsights {
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

interface Props {
  insights: StructuredInsights | string;
  parsedInsights?: StructuredInsights;
  extractedValues?: any[]; // Optional if needed later
}

export const AIInsights: React.FC<Props> = ({ insights, parsedInsights }) => {
  // Use parsed if available, otherwise try to use structured insights
  const data = parsedInsights || (typeof insights === 'object' ? insights : null);
  const fallbackText = typeof insights === 'string' ? insights : null;

  const renderList = (items: string[]) => (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-gray-700">
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <section className="space-y-6">
      {data ? (
        <>
          {/* Structured Interpretation */}
          <Card>
            <CardContent className="space-y-2 pt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-green-600" />
                Lab Results Interpretation
              </h2>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{data.interpretation}</p>
            </CardContent>
          </Card>

          {/* Lifestyle Recommendations */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-green-600" />
                Personalized Lifestyle Recommendations
              </h2>

              {data.lifestyle_recommendations?.diet?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800">🍽️ Diet</h3>
                  {renderList(data.lifestyle_recommendations.diet)}
                </div>
              )}

              {data.lifestyle_recommendations?.exercise?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800">🏋️ Exercise</h3>
                  {renderList(data.lifestyle_recommendations.exercise)}
                </div>
              )}

              {data.lifestyle_recommendations?.sleep?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800">😴 Sleep</h3>
                  {renderList(data.lifestyle_recommendations.sleep)}
                </div>
              )}

              {data.lifestyle_recommendations?.stress?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800">🧘 Stress Management</h3>
                  {renderList(data.lifestyle_recommendations.stress)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgent Flags */}
          {data.urgent_flags?.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Urgent Flags
                </h2>
                {renderList(data.urgent_flags)}
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          {data.disclaimer && (
            <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 text-sm p-4 rounded-md shadow-sm">
              {data.disclaimer}
            </div>
          )}
        </>
      ) : fallbackText ? (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-green-600" />
              Health Insights
            </h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{fallbackText}</pre>
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-500 text-sm">No insights available.</p>
      )}
    </section>
  );
};