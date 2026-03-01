
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
  insights: StructuredInsights;
}

export const AIInsights: React.FC<Props> = ({ insights }) => {
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
      {/* Lab Results Interpretation */}
      {insights.interpretation && (
        <Card className="mb-6">
          <CardContent className="space-y-2 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <HeartPulse className="w-6 h-6 text-green-600" />
              All Insights
            </h2>
            <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
              {insights.interpretation}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lifestyle Recommendations */}
      {insights.lifestyle_recommendations && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <BadgeCheck className="w-6 h-6 text-green-600" />
              Lifestyle Recommendations
            </h2>

            {insights.lifestyle_recommendations.diet?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800">🍽️ Diet</h3>
                {renderList(insights.lifestyle_recommendations.diet)}
              </div>
            )}

            {insights.lifestyle_recommendations.exercise?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800">🏋️ Exercise</h3>
                {renderList(insights.lifestyle_recommendations.exercise)}
              </div>
            )}

            {insights.lifestyle_recommendations.sleep?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800">😴 Sleep</h3>
                {renderList(insights.lifestyle_recommendations.sleep)}
              </div>
            )}

            {insights.lifestyle_recommendations.stress?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800">🧘 Stress Management</h3>
                {renderList(insights.lifestyle_recommendations.stress)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Urgent Flags */}
      {insights.urgent_flags?.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Urgent Flags
            </h2>
            {renderList(insights.urgent_flags)}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {insights.disclaimer && (
        <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 text-sm p-4 rounded-md shadow-sm">
          {insights.disclaimer}
        </div>
      )}
    </section>
  );
};
