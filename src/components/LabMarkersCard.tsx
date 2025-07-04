
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Activity, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LabMarker {
  name: string;
  value: number;
  units?: string;
  reference_range?: string;
}

interface LabMarkersCardProps {
  extractedValues: LabMarker[];
}

const generateStatus = (name: string, value: number, referenceRange?: string): string => {
  // Simple logic for common markers - can be enhanced with more sophisticated AI logic
  const lowerName = name.toLowerCase();
  
  if (referenceRange) {
    // Try to parse reference range like "3.5-5.2" or "3.5 - 5.2"
    const rangeMatch = referenceRange.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
    if (rangeMatch) {
      const [, minStr, maxStr] = rangeMatch;
      const min = parseFloat(minStr);
      const max = parseFloat(maxStr);
      
      if (value < min) return 'Low';
      if (value > max) return 'High';
      return 'Normal';
    }
  }
  
  // Fallback logic for common markers
  if (lowerName.includes('cholesterol') && lowerName.includes('total')) {
    return value > 200 ? 'High' : value < 100 ? 'Low' : 'Normal';
  }
  if (lowerName.includes('ldl')) {
    return value > 130 ? 'High' : value < 70 ? 'Low' : 'Normal';
  }
  if (lowerName.includes('hdl')) {
    return value < 40 ? 'Low' : value > 60 ? 'High' : 'Normal';
  }
  if (lowerName.includes('glucose') || lowerName.includes('sugar')) {
    return value > 100 ? 'High' : value < 70 ? 'Low' : 'Normal';
  }
  
  return 'Normal';
};

const generateInterpretation = (name: string, value: number, status: string, units?: string): string => {
  const lowerName = name.toLowerCase();
  
  if (status === 'High') {
    if (lowerName.includes('cholesterol')) {
      return 'Elevated cholesterol levels may increase cardiovascular risk. Consider dietary changes and exercise.';
    }
    if (lowerName.includes('glucose')) {
      return 'High glucose levels may indicate prediabetes or diabetes. Consult your healthcare provider.';
    }
    return `${name} levels are above normal range. This may require attention from your healthcare provider.`;
  }
  
  if (status === 'Low') {
    if (lowerName.includes('hdl')) {
      return 'Low HDL cholesterol reduces protection against heart disease. Regular exercise can help increase HDL.';
    }
    if (lowerName.includes('vitamin')) {
      return `Low ${name} levels may affect various body functions. Consider discussing supplementation with your doctor.`;
    }
    return `${name} levels are below normal range. This may indicate a deficiency or other health concern.`;
  }
  
  return `${name} levels are within normal range, which is good for your overall health.`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'High':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'Low':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'Normal':
      return 'bg-green-50 border-green-200 text-green-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const getBadgeColor = (status: string) => {
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

export const LabMarkersCard: React.FC<LabMarkersCardProps> = ({ extractedValues }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!extractedValues || extractedValues.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-blue-50/50 transition-colors">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                🧪 Lab Markers ({extractedValues.length})
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {extractedValues.map((marker, index) => {
              const status = generateStatus(marker.name, marker.value, marker.reference_range);
              const interpretation = generateInterpretation(marker.name, marker.value, status, marker.units);
              const cardColor = getStatusColor(status);
              const badgeColor = getBadgeColor(status);
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${cardColor}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{marker.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded font-medium border ${badgeColor}`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="text-sm">
                      <span className="text-gray-600">Your Value: </span>
                      <span className="font-semibold text-gray-900">
                        {marker.value} {marker.units || ''}
                      </span>
                    </div>
                    {marker.reference_range && (
                      <div className="text-sm">
                        <span className="text-gray-600">Reference Range: </span>
                        <span className="font-medium text-gray-700">{marker.reference_range}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 bg-white/60 p-3 rounded border border-gray-200">
                    <span className="font-medium">Interpretation: </span>
                    {interpretation}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
