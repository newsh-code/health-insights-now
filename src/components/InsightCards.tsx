
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BloodMarker } from '@/types';
import { ChevronDown, ChevronUp, Activity, Brain, Apple, Mail, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InsightCardsProps {
  bloodMarkers: BloodMarker[];
}

export const InsightCards: React.FC<InsightCardsProps> = ({ bloodMarkers }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['lab-markers']));
  const [emailData, setEmailData] = useState({ name: '', email: '' });

  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section);
    } else {
      newOpenSections.add(section);
    }
    setOpenSections(newOpenSections);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report Sent!",
      description: "Your personalized health report has been sent to your email.",
    });
    setEmailData({ name: '', email: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Normal':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const aiInsights = [
    "Your HDL cholesterol is slightly low. This could mean your heart isn't getting as much protection as it should. Regular exercise and healthy fats can help boost HDL levels.",
    "Your vitamin D levels are below optimal. Low vitamin D can affect energy levels and immune function. Consider spending more time outdoors or discussing supplementation with your healthcare provider.",
    "Your inflammatory markers are within normal range, which is great news for your overall health. Keep up your current lifestyle habits to maintain this positive trend."
  ];

  const lifestyleSuggestions = {
    diet: [
      "Increase omega-3 rich foods like salmon, walnuts, and flaxseeds",
      "Add more fiber-rich vegetables and fruits to your meals",
      "Consider reducing processed foods and added sugars"
    ],
    supplements: [
      "Vitamin D3 (consult your doctor for proper dosing)",
      "Omega-3 fish oil supplement",
      "Magnesium for better sleep and muscle function"
    ],
    exercise: [
      "Aim for 150 minutes of moderate cardio per week",
      "Include 2-3 strength training sessions",
      "Try high-intensity interval training (HIIT) 1-2 times per week"
    ],
    sleep: [
      "Maintain a consistent sleep schedule (7-9 hours)",
      "Create a relaxing bedtime routine",
      "Limit screen time 1 hour before bed"
    ],
    stress: [
      "Practice deep breathing exercises daily",
      "Consider meditation or mindfulness apps",
      "Schedule regular breaks during work hours"
    ]
  };

  return (
    <div className="space-y-4">
      {/* Lab Markers */}
      <Collapsible 
        open={openSections.has('lab-markers')} 
        onOpenChange={() => toggleSection('lab-markers')}
      >
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">📊 Lab Markers</CardTitle>
                </div>
                {openSections.has('lab-markers') ? 
                  <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {bloodMarkers.map((marker, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{marker.marker}</h4>
                      <Badge className={getStatusColor(marker.status)}>
                        {marker.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Your Value: </span>
                        <span className="font-medium">{marker.value}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Normal Range: </span>
                        <span className="font-medium">{marker.range}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{marker.insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* AI Insights */}
      <Collapsible 
        open={openSections.has('ai-insights')} 
        onOpenChange={() => toggleSection('ai-insights')}
      >
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-lg">🧠 AI Insights</CardTitle>
                </div>
                {openSections.has('ai-insights') ? 
                  <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Lifestyle Suggestions */}
      <Collapsible 
        open={openSections.has('lifestyle')} 
        onOpenChange={() => toggleSection('lifestyle')}
      >
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Apple className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">🍽️ Lifestyle Suggestions</CardTitle>
                </div>
                {openSections.has('lifestyle') ? 
                  <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(lifestyleSuggestions).map(([category, suggestions]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-gray-800 capitalize flex items-center space-x-2">
                      <span>{category === 'diet' ? '🍳' : category === 'supplements' ? '💊' : category === 'exercise' ? '🏃' : category === 'sleep' ? '🛌' : '🧘'}</span>
                      <span>{category}</span>
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> These suggestions are for educational purposes only. Always consult with your healthcare provider before making significant changes to your diet, exercise routine, or starting new supplements.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Email Results */}
      <Collapsible 
        open={openSections.has('email')} 
        onOpenChange={() => toggleSection('email')}
      >
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">📨 Email Results</CardTitle>
                </div>
                {openSections.has('email') ? 
                  <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <p className="text-gray-600 mb-6">
                Get a PDF copy of your personalized health report sent to your email.
              </p>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={emailData.name}
                      onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={emailData.email}
                      onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Report
                  </Button>
                  <Button type="button" variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </form>
              
              <p className="text-xs text-gray-500 mt-4">
                We'll only use your email to send you this report. No spam, ever.
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
