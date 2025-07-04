import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, AlertCircle, HeartPulse, Dumbbell, BedDouble, Leaf } from 'lucide-react';

interface Insights {
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
  insights: Insights;
}

export const AIInsights: React.FC<Props> = ({ insights }) => {
  const { interpretation, lifestyle_recommendations, urgent_flags, disclaimer } = insights;

  const renderList = (items: string[], icon?: React.ReactNode) => (
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
      <Card>
        <CardContent className="space-y-2 pt-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-green-600" />
            Lab Results Interpretation
          </h2>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{interpretation}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-green-600" />
            Personalized Lifestyle Recommendations
          </h2>

          {lifestyle_recommendations?.diet?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                🍽️ Diet
              </h3>
              {renderList(lifestyle_recommendations.diet)}
            </div>
          )}

          {lifestyle_recommendations?.exercise?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                🏋️ Exercise
              </h3>
              {renderList(lifestyle_recommendations.exercise)}
            </div>
          )}

          {lifestyle_recommendations?.sleep?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                😴 Sleep
              </h3>
              {renderList(lifestyle_recommendations.sleep)}
            </div>
          )}

          {lifestyle_recommendations?.stress?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                🧘 Stress Management
              </h3>
              {renderList(lifestyle_recommendations.stress)}
            </div>
          )}
        </CardContent>
      </Card>

      {urgent_flags?.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Urgent Flags
            </h2>
            {renderList(urgent_flags)}
          </CardContent>
        </Card>
      )}

      {disclaimer && (
        <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 text-sm p-4 rounded-md shadow-sm">
          {disclaimer}
        </div>
      )}
    </section>
  );
};