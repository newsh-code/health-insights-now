
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface LifestyleSuggestionsCardProps {
  suggestions: {
    diet?: string[];
    exercise?: string[];
    sleep?: string[];
    stress?: string[];
  };
}

export const LifestyleSuggestionsCard: React.FC<LifestyleSuggestionsCardProps> = ({ suggestions }) => {
  const [isOpen, setIsOpen] = useState(true);

  const sections = [
    { key: 'diet', title: 'Diet', icon: '🍎', items: suggestions.diet || [] },
    { key: 'exercise', title: 'Exercise', icon: '💪', items: suggestions.exercise || [] },
    { key: 'sleep', title: 'Sleep', icon: '😴', items: suggestions.sleep || [] },
    { key: 'stress', title: 'Stress', icon: '🧘', items: suggestions.stress || [] },
  ].filter(section => section.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <Card className="border-green-200 bg-green-50/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-green-50/50 transition-colors">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                💡 Lifestyle Suggestions
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {sections.map((section) => (
                <AccordionItem key={section.key} value={section.key} className="border rounded-lg bg-white">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{section.icon}</span>
                      <span className="font-medium">{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <ul className="space-y-2">
                      {section.items.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
