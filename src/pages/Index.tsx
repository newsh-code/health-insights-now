
import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UserInfoCard } from '@/components/UserInfoCard';
import { ProcessingFlow } from '@/components/ProcessingFlow';
import { LabMarkersCard } from '@/components/LabMarkersCard';
import { AIInsights } from '@/components/AIInsights';
import { EmailResults } from '@/components/EmailResults';
import { UserInfo, ProcessingState, LabMarker, AnalysisResult } from '@/types';
import { useOCRProcessing } from '@/hooks/useOCRProcessing';
import { getMockLabMarkers, getMockAnalysisResult, simulateProcessing } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const Index = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [showResults, setShowResults] = useState(false);
  const [useRealOCR, setUseRealOCR] = useState(false);

  // Demo-mode state (no edge functions involved)
  const [demoProcessing, setDemoProcessing] = useState(false);
  const [demoProcessingState, setDemoProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    stage: 'uploading',
    progress: 0,
  });
  const [demoMarkers, setDemoMarkers] = useState<LabMarker[]>([]);
  const [demoAnalysis, setDemoAnalysis] = useState<AnalysisResult | null>(null);

  // Real-OCR-mode state from hook
  const { isProcessing, extractedValues, analysisResult, processFileAndGenerateInsights } =
    useOCRProcessing();

  // Derived display values — switch between real and demo data
  const displayMarkers = useRealOCR ? extractedValues : demoMarkers;
  const displayAnalysis = useRealOCR ? analysisResult : demoAnalysis;
  const isCurrentlyProcessing = useRealOCR ? isProcessing : demoProcessing;
  const displayProcessingState: ProcessingState = useRealOCR
    ? { isProcessing, stage: 'analyzing', progress: 75 }
    : demoProcessingState;

  const handleFileUpload = async (file: File) => {
    if (useRealOCR) {
      await processFileAndGenerateInsights(file, userInfo);
      setShowResults(true);
    } else {
      // Demo mode: animate through processing stages then show mock data
      setDemoProcessing(true);
      setDemoMarkers([]);
      setDemoAnalysis(null);
      setShowResults(false);

      await simulateProcessing((stage, progress) => {
        setDemoProcessingState({ isProcessing: true, stage, progress });
      });

      setDemoMarkers(getMockLabMarkers());
      setDemoAnalysis(getMockAnalysisResult());
      setDemoProcessing(false);
      setDemoProcessingState({ isProcessing: false, stage: 'complete', progress: 100 });
      setShowResults(true);
    }
  };

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
                variant={useRealOCR ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setUseRealOCR(!useRealOCR);
                  setShowResults(false);
                  setDemoMarkers([]);
                  setDemoAnalysis(null);
                }}
              >
                {useRealOCR ? 'Real OCR ON' : 'Demo Mode'}
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
        {/* Hero */}
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
            Drag & drop your PDF or photo of lab results. No sign-up needed. Get AI-powered
            recommendations tailored to your biomarkers.
          </p>
          {useRealOCR ? (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-6 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm">
                <strong>Real OCR Mode:</strong> Your file will be sent to Claude AI for analysis.
                Files are not stored.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-6 max-w-2xl mx-auto">
              <p className="text-amber-800 text-sm">
                <strong>Demo Mode:</strong> Upload any file to see a sample results page. No data
                is sent anywhere. Switch to Real OCR Mode to analyse your actual report.
              </p>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} isProcessing={isCurrentlyProcessing} />
        </div>

        {/* Processing indicator */}
        {isCurrentlyProcessing && (
          <div className="mb-8">
            <ProcessingFlow processingState={displayProcessingState} />
          </div>
        )}

        {/* User Info — visible before results, not during processing */}
        {!isCurrentlyProcessing && !showResults && (
          <div className="mb-8">
            <UserInfoCard userInfo={userInfo} onUserInfoChange={setUserInfo} />
          </div>
        )}

        {/* Results */}
        {showResults && !isCurrentlyProcessing && (
          <div className="mb-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {useRealOCR ? 'Your Personalized Health Insights' : 'Sample Health Insights (Demo)'}
              </h2>
              <p className="text-gray-600">
                {useRealOCR ? (
                  <>
                    Based on your lab results
                    {userInfo.age && `, age ${userInfo.age}`}
                    {userInfo.sex && `, ${userInfo.sex === 'M' ? 'male' : userInfo.sex === 'F' ? 'female' : userInfo.sex.toLowerCase()}`}
                    {userInfo.goals && `, goal: ${userInfo.goals.replace('-', ' ')}`}
                  </>
                ) : (
                  'This is sample data. Switch to Real OCR Mode and upload your own report for personalised insights.'
                )}
              </p>
            </div>

            {/* Per-marker cards */}
            {displayMarkers.length > 0 && (
              <LabMarkersCard
                extractedValues={displayMarkers}
                markerAnalyses={displayAnalysis?.markers}
              />
            )}

            {/* Overall summary + lifestyle recs + urgent flags */}
            {displayAnalysis && <AIInsights insights={displayAnalysis} />}

            {/* Email results */}
            {(displayMarkers.length > 0 || displayAnalysis) && (
              <EmailResults
                extractedValues={displayMarkers}
                parsedInsights={
                  displayAnalysis
                    ? {
                        interpretation: displayAnalysis.summary,
                        lifestyle_recommendations: displayAnalysis.lifestyle_recommendations,
                        urgent_flags: displayAnalysis.urgent_flags,
                        disclaimer: displayAnalysis.disclaimer,
                      }
                    : null
                }
              />
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>
              <strong>Medical Disclaimer:</strong> This tool is for educational purposes only and is
              not a substitute for professional medical advice. Always consult with your healthcare
              provider before making any changes to your health routine.
            </p>
            <p>
              <strong>Privacy:</strong> Your files are processed securely and not stored on our
              servers.{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Data Policy
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
