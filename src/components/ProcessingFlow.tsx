
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProcessingState } from '@/types';
import { FileSearch, Brain, Sparkles } from 'lucide-react';

interface ProcessingFlowProps {
  processingState: ProcessingState;
}

export const ProcessingFlow: React.FC<ProcessingFlowProps> = ({ processingState }) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'uploading':
        return <FileSearch className="w-6 h-6 text-blue-600" />;
      case 'extracting':
        return <FileSearch className="w-6 h-6 text-blue-600" />;
      case 'analyzing':
        return <Brain className="w-6 h-6 text-purple-600" />;
      case 'complete':
        return <Sparkles className="w-6 h-6 text-green-600" />;
      default:
        return <FileSearch className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'uploading':
        return 'Uploading your file...';
      case 'extracting':
        return 'Extracting biomarker data...';
      case 'analyzing':
        return 'Generating AI insights...';
      case 'complete':
        return 'Analysis complete!';
      default:
        return 'Processing...';
    }
  };

  if (!processingState.isProcessing) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-center space-x-4 mb-4">
        {getStageIcon(processingState.stage)}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{getStageText(processingState.stage)}</h3>
          <p className="text-sm text-gray-600">This usually takes 10-30 seconds</p>
        </div>
      </div>
      
      <Progress value={processingState.progress} className="w-full" />
      
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span className={processingState.stage === 'uploading' ? 'text-blue-600 font-medium' : ''}>
          Upload
        </span>
        <span className={processingState.stage === 'extracting' ? 'text-blue-600 font-medium' : ''}>
          Extract
        </span>
        <span className={processingState.stage === 'analyzing' ? 'text-purple-600 font-medium' : ''}>
          Analyze
        </span>
        <span className={processingState.stage === 'complete' ? 'text-green-600 font-medium' : ''}>
          Complete
        </span>
      </div>
    </Card>
  );
};
