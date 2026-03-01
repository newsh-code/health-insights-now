
export interface UserInfo {
  age?: number;
  sex?: 'M' | 'F' | 'Other';
  goals?: string;
  activity?: 'Sedentary' | 'Active' | 'Athlete';
}

export interface BloodMarker {
  marker: string;
  value: string;
  range: string;
  status: 'Low' | 'Normal' | 'High';
  insight: string;
  recommendation: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  stage: 'uploading' | 'extracting' | 'analyzing' | 'complete';
  progress: number;
}

export interface LabMarker {
  name: string;
  value: number;
  unit?: string;
  units?: string;
  reference_range?: string;
  status?: 'low' | 'normal' | 'high';
}

export interface MarkerAnalysis {
  name: string;
  status: 'low' | 'normal' | 'high';
  explanation: string;
  conversation_starter: string;
}

export interface AnalysisResult {
  markers: MarkerAnalysis[];
  summary: string;
  lifestyle_recommendations: {
    diet: string[];
    exercise: string[];
    sleep: string[];
    stress: string[];
  };
  urgent_flags: string[];
  disclaimer: string;
}
