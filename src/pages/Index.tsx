
import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UserInfoCard } from '@/components/UserInfoCard';
import { ProcessingFlow } from '@/components/ProcessingFlow';
import { ResultsTriage } from '@/components/ResultsTriage';
import { EmailResults } from '@/components/EmailResults';
import { UserInfo, ProcessingState, LabMarker, AnalysisResult } from '@/types';
import { useOCRProcessing } from '@/hooks/useOCRProcessing';
import { getMockLabMarkers, getMockAnalysisResult, simulateProcessing } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, ExternalLink } from 'lucide-react';

const PROFILE_KEY = 'biolens_user_profile';

const loadProfile = (): UserInfo => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const Index = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>(loadProfile);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(userInfo));
  }, [userInfo]);
  const [showResults, setShowResults] = useState(false);
  const [useRealOCR, setUseRealOCR] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

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
  const { isProcessing, extractedValues, analysisResult, uploadError, clearUploadError, processFileAndGenerateInsights } =
    useOCRProcessing();

  const isProfileComplete = !!(userInfo.age && userInfo.sex && userInfo.activity);

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
                  clearUploadError();
                  setUploadKey(k => k + 1);
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

        {/* User Profile — always visible before results */}
        {!showResults && (
          <div className="mb-8">
            <UserInfoCard userInfo={userInfo} onUserInfoChange={setUserInfo} />
          </div>
        )}

        {/* File Upload — unlocked once required profile fields are filled */}
        {!showResults && (
          <div className="mb-8">
            <FileUpload
              key={uploadKey}
              onFileUpload={handleFileUpload}
              isProcessing={isCurrentlyProcessing}
              disabled={!isProfileComplete}
            />
          </div>
        )}

        {/* Upload error state (real OCR mode only) */}
        {useRealOCR && uploadError && !isCurrentlyProcessing && (
          <div className="mb-8">
            <Card className="p-6 border-orange-200 bg-orange-50">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-1">Couldn't process this file</h3>
                  <p className="text-sm text-orange-700 mb-3">{uploadError}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    onClick={() => {
                      clearUploadError();
                      setUploadKey(k => k + 1);
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Processing indicator */}
        {isCurrentlyProcessing && (
          <div className="mb-8">
            <ProcessingFlow processingState={displayProcessingState} />
          </div>
        )}

        {/* Results — only render when there is actual analysis data and no error */}
        {showResults && !isCurrentlyProcessing && !!displayAnalysis && !uploadError && (
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

            {/* Tiered results: urgent flags → needs attention → all good → summary → lifestyle */}
            {displayAnalysis && (
              <ResultsTriage extractedValues={displayMarkers} insights={displayAnalysis} />
            )}

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
