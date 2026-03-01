
import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UserInfoCard } from '@/components/UserInfoCard';
import { ProcessingFlow } from '@/components/ProcessingFlow';
import { LabMarkersCard } from '@/components/LabMarkersCard';
import { AIInsights } from '@/components/AIInsights';
import { EmailResults } from '@/components/EmailResults';
import { UserInfo, ProcessingState } from '@/types';
import { useOCRProcessing } from '@/hooks/useOCRProcessing';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const Index = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [processingState] = useState<ProcessingState>({
    isProcessing: false,
    stage: 'uploading',
    progress: 0,
  });
  const [showResults, setShowResults] = useState(false);
  const [useRealOCR, setUseRealOCR] = useState(false);

  const { isProcessing, extractedValues, analysisResult, processFileAndGenerateInsights } =
    useOCRProcessing();

  const handleFileUpload = async (file: File) => {
    if (useRealOCR) {
      await processFileAndGenerateInsights(file, userInfo);
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
                onClick={() => setUseRealOCR(!useRealOCR)}
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
          {useRealOCR && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-6 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm">
                <strong>Real OCR Mode:</strong> Your files will be processed using OCR and analysed
                by Claude AI. Files are not stored.
              </p>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <div className="mb-8">
            <ProcessingFlow
              processingState={{
                isProcessing: true,
                stage: 'analyzing',
                progress: 75,
              }}
            />
          </div>
        )}

        {/* User Info — visible before upload when not processing */}
        {!isProcessing && !showResults && (
          <div className="mb-8">
            <UserInfoCard userInfo={userInfo} onUserInfoChange={setUserInfo} />
          </div>
        )}

        {/* Results */}
        {showResults && useRealOCR && (
          <div className="mb-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Personalized Health Insights
              </h2>
              <p className="text-gray-600">
                Based on your lab results
                {userInfo.age && `, age ${userInfo.age}`}
                {userInfo.sex &&
                  `, ${userInfo.sex === 'M' ? 'male' : userInfo.sex === 'F' ? 'female' : userInfo.sex.toLowerCase()}`}
                {userInfo.goals && `, goal: ${userInfo.goals.replace('-', ' ')}`}
              </p>
            </div>

            {/* Per-marker cards with AI explanations + conversation starters */}
            {extractedValues.length > 0 && (
              <LabMarkersCard
                extractedValues={extractedValues}
                markerAnalyses={analysisResult?.markers}
              />
            )}

            {/* Overall summary + lifestyle recs + urgent flags */}
            {analysisResult && (
              <AIInsights insights={analysisResult} />
            )}

            {/* Email results */}
            {(extractedValues.length > 0 || analysisResult) && (
              <EmailResults
                extractedValues={extractedValues}
                parsedInsights={
                  analysisResult
                    ? {
                        interpretation: analysisResult.summary,
                        lifestyle_recommendations: analysisResult.lifestyle_recommendations,
                        urgent_flags: analysisResult.urgent_flags,
                        disclaimer: analysisResult.disclaimer,
                      }
                    : null
                }
              />
            )}
          </div>
        )}

        {/* Demo mode message */}
        {!useRealOCR && showResults && (
          <div className="mb-8">
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Demo Mode Active</h3>
              <p className="text-amber-700">
                Enable "Real OCR Mode" above to process your lab results and get personalized
                insights.
              </p>
            </div>
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
              servers.
              <a href="#" className="text-blue-600 hover:underline ml-1">
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
