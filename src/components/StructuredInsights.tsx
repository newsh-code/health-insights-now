
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Brain, Lightbulb, AlertTriangle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface StructuredInsightsProps {
  insights: {
    interpretation: string;
    lifestyle_recommendations: {
      diet: string[];
      exercise: string[];
      sleep: string[];
      stress: string[];
    };
    urgent_flags: string[];
    disclaimer: string;
  };
}

export const StructuredInsights: React.FC<StructuredInsightsProps> = ({ insights }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['interpretation', 'recommendations']));

  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section);
    } else {
      newOpenSections.add(section);
    }
    setOpenSections(newOpenSections);
  };

  const lifestyleSections = [
    { key: 'diet', title: 'Diet', icon: '🍽️', items: insights.lifestyle_recommendations.diet || [] },
    { key: 'exercise', title: 'Exercise', icon: '🏃', items: insights.lifestyle_recommendations.exercise || [] },
    { key: 'sleep', title: 'Sleep', icon: '😴', items: insights.lifestyle_recommendations.sleep || [] },
    { key: 'stress', title: 'Stress Management', icon: '🧘', items: insights.lifestyle_recommendations.stress || [] },
  ].filter(section => section.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Lab Results Interpretation */}
      {insights.interpretation && (
        <Card className="border-purple-200 bg-purple-50/30">
          <Collapsible 
            open={openSections.has('interpretation')} 
            onOpenChange={() => toggleSection('interpretation')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-purple-50/50 transition-colors">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    💡 Lab Results Interpretation
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has('interpretation') ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {insights.interpretation}
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Lifestyle Recommendations */}
      {lifestyleSections.length > 0 && (
        <Card className="border-green-200 bg-green-50/30">
          <Collapsible 
            open={openSections.has('recommendations')} 
            onOpenChange={() => toggleSection('recommendations')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-green-50/50 transition-colors">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                    💡 Personalized Lifestyle Recommendations
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has('recommendations') ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lifestyleSections.map((section) => (
                    <div key={section.key} className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-lg">{section.icon}</span>
                        <span>{section.title}</span>
                      </h4>
                      <div className="space-y-2">
                        {section.items.map((item, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border border-gray-100">
                            <span className="text-green-600 mt-1 text-sm">•</span>
                            <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Urgent Flags */}
      {insights.urgent_flags && insights.urgent_flags.length > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <Collapsible 
            open={openSections.has('urgent')} 
            onOpenChange={() => toggleSection('urgent')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-red-50/50 transition-colors">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    ⚠️ Urgent Flags
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has('urgent') ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-3">
                  {insights.urgent_flags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-800 leading-relaxed">{flag}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Disclaimer */}
      {insights.disclaimer && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Medical Disclaimer:</p>
                <p className="leading-relaxed">{insights.disclaimer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
