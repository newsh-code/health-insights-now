
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, AlertCircle, HeartPulse } from 'lucide-react';
import { AnalysisResult } from '@/types';

interface Props {
  insights: AnalysisResult;
}

const renderList = (items: string[]) => (
  <ul className="list-disc list-inside space-y-1">
    {items.map((item, i) => (
      <li key={i} className="text-sm text-gray-700">
        {item}
      </li>
    ))}
  </ul>
);

export const AIInsights: React.FC<Props> = ({ insights }) => {
  const recs = insights.lifestyle_recommendations;
  const hasRecs =
    recs &&
    (recs.diet?.length || recs.exercise?.length || recs.sleep?.length || recs.stress?.length);

  return (
    <section className="space-y-6">
      {/* Overall summary */}
      {insights.summary && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <HeartPulse className="w-6 h-6 text-green-600" />
              Overall Summary
            </h2>
            <p className="text-gray-700 text-base leading-relaxed">{insights.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Lifestyle recommendations */}
      {hasRecs && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <BadgeCheck className="w-6 h-6 text-green-600" />
              Lifestyle Recommendations
            </h2>
            {recs.diet?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Diet</h3>
                {renderList(recs.diet)}
              </div>
            )}
            {recs.exercise?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Exercise</h3>
                {renderList(recs.exercise)}
              </div>
            )}
            {recs.sleep?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Sleep</h3>
                {renderList(recs.sleep)}
              </div>
            )}
            {recs.stress?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Stress Management</h3>
                {renderList(recs.stress)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Urgent flags */}
      {insights.urgent_flags?.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5" />
              Urgent Flags
            </h2>
            {renderList(insights.urgent_flags)}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {insights.disclaimer && (
        <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 text-sm p-4 rounded-md">
          {insights.disclaimer}
        </div>
      )}
    </section>
  );
};
