
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
