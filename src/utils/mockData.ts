
import { BloodMarker } from '@/types';

export const generateMockBloodMarkers = (): BloodMarker[] => {
  return [
    {
      marker: "Total Cholesterol",
      value: "195 mg/dL",
      range: "< 200 mg/dL",
      status: "Normal",
      insight: "Your total cholesterol is within the healthy range. This is a good indicator of your cardiovascular health.",
      recommendation: "Maintain your current diet and exercise routine to keep cholesterol levels stable."
    },
    {
      marker: "HDL Cholesterol",
      value: "35 mg/dL",
      range: "> 40 mg/dL (M), > 50 mg/dL (F)",
      status: "Low",
      insight: "HDL is known as 'good' cholesterol. Low levels may reduce protection against heart disease.",
      recommendation: "Increase aerobic exercise and consume healthy fats like those found in olive oil, nuts, and avocados."
    },
    {
      marker: "LDL Cholesterol",
      value: "130 mg/dL",
      range: "< 100 mg/dL",
      status: "High",
      insight: "LDL is 'bad' cholesterol. Elevated levels may increase your risk of heart disease and stroke.",
      recommendation: "Reduce saturated fat intake, increase fiber consumption, and consider speaking with your doctor about treatment options."
    },
    {
      marker: "Vitamin D",
      value: "18 ng/mL",
      range: "30-100 ng/mL",
      status: "Low",
      insight: "Vitamin D is crucial for bone health, immune function, and mood regulation. Low levels are very common.",
      recommendation: "Spend 15-20 minutes in sunlight daily, eat vitamin D-rich foods, and consider supplementation after consulting your doctor."
    },
    {
      marker: "Hemoglobin A1c",
      value: "5.2%",
      range: "< 5.7%",
      status: "Normal",
      insight: "This measures your average blood sugar over the past 2-3 months. Your level indicates good glucose control.",
      recommendation: "Continue your current lifestyle habits to maintain healthy blood sugar levels."
    },
    {
      marker: "TSH (Thyroid)",
      value: "2.8 mIU/L",
      range: "0.4-4.0 mIU/L",
      status: "Normal",
      insight: "Your thyroid function appears normal. TSH regulates your metabolism and energy levels.",
      recommendation: "Monitor energy levels and weight changes, as these can indicate thyroid function changes over time."
    }
  ];
};

export const simulateProcessing = (
  onProgress: (stage: 'uploading' | 'extracting' | 'analyzing' | 'complete', progress: number) => void
): Promise<BloodMarker[]> => {
  return new Promise((resolve) => {
    let progress = 0;
    
    // Uploading stage
    onProgress('uploading', 0);
    const uploadInterval = setInterval(() => {
      progress += 10;
      onProgress('uploading', progress);
      if (progress >= 25) {
        clearInterval(uploadInterval);
        
        // Extracting stage
        onProgress('extracting', 25);
        const extractInterval = setInterval(() => {
          progress += 8;
          onProgress('extracting', progress);
          if (progress >= 60) {
            clearInterval(extractInterval);
            
            // Analyzing stage
            onProgress('analyzing', 60);
            const analyzeInterval = setInterval(() => {
              progress += 5;
              onProgress('analyzing', progress);
              if (progress >= 95) {
                clearInterval(analyzeInterval);
                
                // Complete
                setTimeout(() => {
                  onProgress('complete', 100);
                  resolve(generateMockBloodMarkers());
                }, 500);
              }
            }, 200);
          }
        }, 150);
      }
    }, 100);
  });
};
