
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

const getStatusColor = (name: string, value: number) => {
  // Simple logic for demo purposes - you can enhance this
  const lowerName = name.toLowerCase();
  if (lowerName.includes('cholesterol') || lowerName.includes('ldl')) {
    return value > 200 ? 'bg-red-50 border-red-200' : value > 100 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200';
  }
  if (lowerName.includes('hdl')) {
    return value < 40 ? 'bg-red-50 border-red-200' : value < 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200';
  }
  return 'bg-gray-50 border-gray-200';
};

const getStatusLabel = (name: string, value: number) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('cholesterol') || lowerName.includes('ldl')) {
    return value > 200 ? 'High' : value > 100 ? 'Borderline' : 'Normal';
  }
  if (lowerName.includes('hdl')) {
    return value < 40 ? 'Low' : value < 60 ? 'Borderline' : 'Normal';
  }
  return 'Normal';
};

export const LabMarkersCard: React.FC<LabMarkersCardProps> = ({ extractedValues }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!extractedValues.length) return null;

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
          <CardContent className="space-y-3">
            {extractedValues.map((marker, index) => {
              const statusColor = getStatusColor(marker.name, marker.value);
              const statusLabel = getStatusLabel(marker.name, marker.value);
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${statusColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{marker.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      statusLabel === 'High' || statusLabel === 'Low' ? 'bg-red-100 text-red-800' :
                      statusLabel === 'Borderline' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Your Value: <strong>{marker.value} {marker.units}</strong></span>
                      {marker.reference_range && (
                        <span className="text-gray-500">Normal Range: {marker.reference_range}</span>
                      )}
                    </div>
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
