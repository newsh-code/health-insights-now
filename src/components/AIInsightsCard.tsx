
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Brain, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIInsightsCardProps {
  insights: string;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ insights }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!insights) return null;

  // Parse insights into sections
  const sections = insights.split(/(?=^#{1,3}\s)/gm).filter(section => section.trim());

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-purple-50/50 transition-colors">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                🤖 AI Insights
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="prose prose-sm max-w-none">
            <ReactMarkdown 
              components={{
                h1: ({children}) => (
                  <h1 className="text-xl font-bold text-gray-900 mb-3 mt-6 first:mt-0 flex items-center gap-2">
                    💡 {children}
                  </h1>
                ),
                h2: ({children}) => (
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-5 first:mt-0 flex items-center gap-2">
                    ✅ {children}
                  </h2>
                ),
                h3: ({children}) => (
                  <h3 className="text-base font-medium text-gray-800 mb-2 mt-4 first:mt-0 flex items-center gap-2">
                    🎯 {children}
                  </h3>
                ),
                p: ({children}) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2 ml-2">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-2">{children}</ol>,
                li: ({children}) => <li className="text-gray-700 leading-relaxed">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-amber-400 bg-amber-50 p-3 my-4 italic">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600">⚠️</span>
                      <div>{children}</div>
                    </div>
                  </blockquote>
                ),
              }}
            >
              {insights}
            </ReactMarkdown>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
