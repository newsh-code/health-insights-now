
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Activity, ChevronDown, MessageCircle } from 'lucide-react';
import { MarkerAnalysis } from '@/types';

interface LabMarker {
  name: string;
  value: number;
  unit?: string;
  units?: string;
  reference_range?: string;
  status?: 'low' | 'normal' | 'high';
}

interface LabMarkersCardProps {
  extractedValues: LabMarker[];
  markerAnalyses?: MarkerAnalysis[];
}

const STATUS_LABEL: Record<string, string> = {
  high: 'High',
  low: 'Low',
  normal: 'Normal',
};

const getStatusFromRange = (value: number, referenceRange?: string): string => {
  if (!referenceRange) return 'Normal';
  const rangeMatch = referenceRange.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (value < min) return 'Low';
    if (value > max) return 'High';
    return 'Normal';
  }
  const upperMatch = referenceRange.match(/(?:up to|<)\s*(\d+(?:\.\d+)?)/i);
  if (upperMatch) return value > parseFloat(upperMatch[1]) ? 'High' : 'Normal';
  const lowerMatch = referenceRange.match(/>\s*(\d+(?:\.\d+)?)/);
  if (lowerMatch) return value < parseFloat(lowerMatch[1]) ? 'Low' : 'Normal';
  return 'Normal';
};

const resolveStatus = (marker: LabMarker, analysis?: MarkerAnalysis): string => {
  if (analysis?.status) return STATUS_LABEL[analysis.status] ?? 'Normal';
  if (marker.status) return STATUS_LABEL[marker.status] ?? 'Normal';
  return getStatusFromRange(marker.value, marker.reference_range);
};

const statusCardClass = (status: string) => {
  if (status === 'High') return 'bg-red-50 border-red-200';
  if (status === 'Low') return 'bg-yellow-50 border-yellow-200';
  return 'bg-green-50 border-green-200';
};

const statusBadgeClass = (status: string) => {
  if (status === 'High') return 'bg-red-100 text-red-800 border-red-200';
  if (status === 'Low') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
};

export const LabMarkersCard: React.FC<LabMarkersCardProps> = ({
  extractedValues,
  markerAnalyses,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!extractedValues || extractedValues.length === 0) return null;

  // Build a lookup map: normalised name → MarkerAnalysis
  const analysisMap = new Map<string, MarkerAnalysis>(
    (markerAnalyses ?? []).map(a => [a.name.toLowerCase().trim(), a])
  );

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-blue-50/50 transition-colors">
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Lab Markers ({extractedValues.length})
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {extractedValues.map((marker, index) => {
              const analysis = analysisMap.get(marker.name.toLowerCase().trim());
              const status = resolveStatus(marker, analysis);
              const unit = marker.unit || marker.units || '';

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${statusCardClass(status)}`}
                >
                  {/* Header row */}
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 text-base">{marker.name}</h4>
                    <span
                      className={`px-2 py-0.5 text-xs rounded font-medium border ${statusBadgeClass(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Value + Reference */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Your value: </span>
                      <span className="font-semibold text-gray-900">
                        {marker.value}{unit ? ` ${unit}` : ''}
                      </span>
                    </div>
                    {marker.reference_range && (
                      <div>
                        <span className="text-gray-500">Reference: </span>
                        <span className="font-medium text-gray-700">{marker.reference_range}</span>
                      </div>
                    )}
                  </div>

                  {/* AI explanation */}
                  {analysis?.explanation && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {analysis.explanation}
                    </p>
                  )}

                  {/* Conversation starter */}
                  {analysis?.conversation_starter && (
                    <div className="flex items-start gap-2 bg-white/70 rounded-md border border-gray-200 px-3 py-2">
                      <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="text-xs text-gray-600">
                        <span className="font-medium text-blue-700 block mb-0.5">
                          Ask your doctor:
                        </span>
                        {analysis.conversation_starter}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
