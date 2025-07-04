import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UserInfoCard } from '@/components/UserInfoCard';
import { ProcessingFlow } from '@/components/ProcessingFlow';
import { InsightCards } from '@/components/InsightCards';
import { AIInsights } from '@/components/AIInsights';
import { UserInfo, BloodMarker, ProcessingState } from '@/types';
import { simulateProcessing } from '@/utils/mockData';
import { useOCRProcessing } from '@/hooks/useOCRProcessing';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const Index = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    stage: 'uploading',
    progress: 0
  });
  const [bloodMarkers, setBloodMarkers] = useState<BloodMarker[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [useRealOCR, setUseRealOCR] = useState(false);
  
  const { isProcessing: ocrProcessing, extractedValues, insights, parsedInsights, processFileAndGenerateInsights } = useOCRProcessing();

  const handleFileUpload = async (file: File) => {
    console.log('File uploaded:', file.name, 'Real OCR mode:', useRealOCR);
    
    if (useRealOCR) {
      // Use real OCR + AI pipeline with user info
      console.log('Processing with user info:', userInfo);
      await processFileAndGenerateInsights(file, userInfo);
      
      // Set showResults to true after processing completes (whether successful or not)
      // The actual success check happens in the rendering conditions below
      setShowResults(true);
    } else {
      // Use existing mock data flow
      setProcessingState({
        isProcessing: true,
        stage: 'uploading',
        progress: 0
      });

      try {
        const results = await simulateProcessing((stage, progress) => {
          setProcessingState({
            isProcessing: true,
            stage,
            progress
          });
        });

        setBloodMarkers(results);
        setShowResults(true);
        setProcessingState({
          isProcessing: false,
          stage: 'complete',
          progress: 100
        });
      } catch (error) {
        console.error('Processing failed:', error);
        setProcessingState({
          isProcessing: false,
          stage: 'uploading',
          progress: 0
        });
      }
    }
  };

  const isCurrentlyProcessing = processingState.isProcessing || ocrProcessing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BL</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">BioLens</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={useRealOCR ? "default" : "outline"} 
                size="sm" 
                onClick={() => setUseRealOCR(!useRealOCR)}
              >
                {useRealOCR ? "Real OCR ON" : "Demo Mode"}
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <ExternalLink className="w-4 h-4 mr-2" />
                Sample Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upload Your Blood Test.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Get Personalized Health Insights
            </span>
            <br />
            — Instantly.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Drag & drop your PDF or photo of lab results. No sign-up needed.
            Get AI-powered recommendations tailored to your biomarkers.
          </p>
          {useRealOCR && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-6 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm">
                <strong>Real OCR Mode:</strong> Your files will be processed using OCR and sent to AI for analysis.
                Files are not stored and processed securely.
              </p>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <FileUpload 
            onFileUpload={handleFileUpload} 
            isProcessing={isCurrentlyProcessing}
          />
        </div>

        {/* Processing Flow */}
        {processingState.isProcessing && (
          <div className="mb-8">
            <ProcessingFlow processingState={processingState} />
          </div>
        )}

        {/* OCR Processing Indicator */}
        {ocrProcessing && (
          <div className="mb-8">
            <ProcessingFlow processingState={{
              isProcessing: true,
              stage: 'analyzing',
              progress: 75
            }} />
          </div>
        )}

        {/* User Info Card - Show when not processing and no results yet */}
        {!isCurrentlyProcessing && !showResults && (
          <div className="mb-8">
            <UserInfoCard 
              userInfo={userInfo} 
              onUserInfoChange={setUserInfo}
            />
          </div>
        )}

        {/* Debug Output */}
        {showResults && (
          <div className="mb-8">
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify({ insights, parsedInsights }, null, 2)}
            </pre>
          </div>
        )}

        {/* Real OCR Results - Only render when parsedInsights are fully parsed and valid */}
        {showResults && parsedInsights && typeof parsedInsights === 'object' && (
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Personalized Health Insights</h2>
              <p className="text-gray-600">
                Based on your lab results
                {userInfo.age && `, age ${userInfo.age}`}
                {userInfo.sex && `, ${userInfo.sex === 'M' ? 'male' : userInfo.sex === 'F' ? 'female' : userInfo.sex.toLowerCase()}`}
                {userInfo.goals && `, with a goal to ${userInfo.goals.replace('-', ' ')}`}
              </p>
            </div>

            <InsightCards bloodMarkers={bloodMarkers} />
            <AIInsights insights={parsedInsights} />
          </div>
        )}

        {/* Mock Results - Only render when not in real OCR mode */}
        {!useRealOCR && showResults && (
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Personalized Health Insights</h2>
              <p className="text-gray-600">
                Based on your lab results{userInfo.age && `, age ${userInfo.age}`}
                {userInfo.sex && `, ${userInfo.sex === 'M' ? 'male' : userInfo.sex === 'F' ? 'female' : userInfo.sex.toLowerCase()}`}
                {userInfo.goals && `, with a goal to ${userInfo.goals.replace('-', ' ')}`}
              </p>
            </div>
            <InsightCards bloodMarkers={bloodMarkers} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>
              <strong>Medical Disclaimer:</strong> This tool is for educational purposes only and is not a substitute for professional medical advice.
              Always consult with your healthcare provider before making any changes to your health routine.
            </p>
            <p>
              <strong>Privacy:</strong> Your files are processed securely and not stored on our servers.
              <a href="#" className="text-blue-600 hover:underline ml-1">Data Policy</a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
