
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
  const lowerName = name.toLowerCase();
  
  if (referenceRange) {
    // Try to parse reference range like "3.5-5.2" or "3.5 - 5.2" or "130–170"
    const rangeMatch = referenceRange.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      const [, minStr, maxStr] = rangeMatch;
      const min = parseFloat(minStr);
      const max = parseFloat(maxStr);
      
      if (value < min) return 'Low';
      if (value > max) return 'High';
      return 'Normal';
    }
    
    // Handle "Up to X" or "< X" format
    const upperMatch = referenceRange.match(/(?:up to|<)\s*(\d+(?:\.\d+)?)/i);
    if (upperMatch) {
      const upperLimit = parseFloat(upperMatch[1]);
      return value > upperLimit ? 'High' : 'Normal';
    }
    
    // Handle "> X" format
    const lowerMatch = referenceRange.match(/>\s*(\d+(?:\.\d+)?)/);
    if (lowerMatch) {
      const lowerLimit = parseFloat(lowerMatch[1]);
      return value < lowerLimit ? 'Low' : 'Normal';
    }
  }
  
  // Fallback logic for common markers when reference range can't be parsed
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
  
  // Specific interpretations for common markers
  if (lowerName.includes('cholesterol') && lowerName.includes('total')) {
    if (status === 'High') return 'Total cholesterol measures all cholesterol in your blood. High levels increase your risk of heart disease and stroke.';
    if (status === 'Low') return 'Total cholesterol is below normal range. While low cholesterol is generally good, extremely low levels may indicate other health issues.';
    return 'Total cholesterol measures all cholesterol in your blood. This level supports good cardiovascular health.';
  }
  
  if (lowerName.includes('ldl')) {
    if (status === 'High') return 'LDL is often called "bad" cholesterol because it can build up in artery walls, increasing heart disease risk.';
    if (status === 'Low') return 'LDL cholesterol is well-controlled. Low LDL levels reduce your risk of heart disease and stroke.';
    return 'LDL cholesterol is within target range, supporting good cardiovascular health.';
  }
  
  if (lowerName.includes('hdl')) {
    if (status === 'High') return 'HDL is "good" cholesterol that helps remove harmful cholesterol from your bloodstream. Higher levels are protective.';
    if (status === 'Low') return 'HDL helps remove bad cholesterol from your bloodstream. Regular exercise and healthy fats can help increase HDL levels.';
    return 'HDL cholesterol levels support cardiovascular protection by removing excess cholesterol from your arteries.';
  }
  
  if (lowerName.includes('glucose') || lowerName.includes('sugar')) {
    if (status === 'High') return 'Blood glucose measures sugar levels in your blood. Elevated levels may indicate prediabetes or diabetes risk.';
    if (status === 'Low') return 'Blood glucose is below normal range, which may cause symptoms like dizziness or fatigue if severe.';
    return 'Blood glucose levels are well-controlled, indicating good metabolic function.';
  }
  
  if (lowerName.includes('hemoglobin') || lowerName.includes('hgb')) {
    if (status === 'High') return 'Hemoglobin carries oxygen in your blood. High levels may indicate dehydration or underlying blood disorders.';
    if (status === 'Low') return 'Hemoglobin carries oxygen throughout your body. Low levels may indicate anemia or iron deficiency.';
    return 'Hemoglobin levels support optimal oxygen transport throughout your body.';
  }
  
  if (lowerName.includes('creatinine')) {
    if (status === 'High') return 'Creatinine measures kidney function. Elevated levels may indicate reduced kidney filtering capacity.';
    if (status === 'Low') return 'Creatinine is a waste product filtered by your kidneys. Low levels are typically not concerning.';
    return 'Creatinine levels indicate healthy kidney function and waste filtration.';
  }
  
  // Generic fallbacks for other markers
  if (status === 'High') {
    return `${name} levels are elevated, which may require attention from your healthcare provider for proper evaluation.`;
  }
  
  if (status === 'Low') {
    return `${name} levels are below normal range, which may indicate a deficiency or other health consideration.`;
  }
  
  return `${name} levels are within normal range, supporting overall health.`;
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
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
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
                        <span className="text-gray-600">Reference: </span>
                        <span className="font-medium text-gray-700">{marker.reference_range}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 mt-2">
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
