
import { BloodMarker, LabMarker, AnalysisResult } from '@/types';

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

export const getMockLabMarkers = (): LabMarker[] => [
  { name: 'Total Cholesterol', value: 195, unit: 'mg/dL', reference_range: '< 200', status: 'normal' },
  { name: 'HDL Cholesterol',   value: 35,  unit: 'mg/dL', reference_range: '> 40',  status: 'low'    },
  { name: 'LDL Cholesterol',   value: 130, unit: 'mg/dL', reference_range: '< 100', status: 'high'   },
  { name: 'Vitamin D',         value: 18,  unit: 'ng/mL', reference_range: '30–100', status: 'low'   },
  { name: 'Hemoglobin A1c',    value: 5.2, unit: '%',     reference_range: '< 5.7', status: 'normal' },
  { name: 'TSH',               value: 2.8, unit: 'mIU/L', reference_range: '0.4–4.0', status: 'normal' },
];

export const getMockAnalysisResult = (): AnalysisResult => ({
  markers: [
    {
      name: 'Total Cholesterol',
      status: 'normal',
      explanation: 'Your total cholesterol of 195 mg/dL is within the healthy range (below 200 mg/dL). This is a good sign for your cardiovascular health and suggests your body is managing fats effectively.',
      conversation_starter: 'Doctor, my total cholesterol is 195 — is there anything I should watch to keep it in this range long-term?',
    },
    {
      name: 'HDL Cholesterol',
      status: 'low',
      explanation: 'Your HDL ("good") cholesterol of 35 mg/dL is below the recommended minimum of 40 mg/dL. HDL helps carry excess cholesterol away from your arteries, so low levels can reduce your heart-protective effect.',
      conversation_starter: 'I noticed my HDL is a bit low at 35. What lifestyle changes would have the biggest impact on raising it?',
    },
    {
      name: 'LDL Cholesterol',
      status: 'high',
      explanation: 'Your LDL ("bad") cholesterol of 130 mg/dL is above the ideal target of under 100 mg/dL. Elevated LDL can contribute to plaque buildup in arteries over time, which is worth discussing with your doctor.',
      conversation_starter: 'Doctor, my LDL came back at 130. Given my overall profile, should I be looking at dietary changes, medication, or both?',
    },
    {
      name: 'Vitamin D',
      status: 'low',
      explanation: 'Your Vitamin D level of 18 ng/mL is below the optimal range of 30–100 ng/mL. Vitamin D deficiency is very common and can affect bone density, immune function, and energy levels.',
      conversation_starter: 'My Vitamin D is at 18 — what dosage of supplementation would you recommend, and how long until we retest?',
    },
    {
      name: 'Hemoglobin A1c',
      status: 'normal',
      explanation: 'Your HbA1c of 5.2% reflects excellent average blood sugar control over the past 2–3 months. Anything below 5.7% is considered normal, so you are well within the healthy zone.',
      conversation_starter: 'My A1c looks good at 5.2% — are there any dietary patterns you recommend to help keep it here?',
    },
    {
      name: 'TSH',
      status: 'normal',
      explanation: 'Your TSH of 2.8 mIU/L is comfortably within the normal range of 0.4–4.0 mIU/L, indicating your thyroid is functioning well and producing hormones at the right level.',
      conversation_starter: 'My TSH is normal — at what point would you recommend retesting thyroid function, or is this only needed if symptoms develop?',
    },
  ],
  summary: 'Overall your results are largely positive, with well-controlled blood sugar and thyroid function. The two areas worth focusing on are your HDL (low) and LDL (elevated) cholesterol, and your Vitamin D deficiency — all three are very actionable through lifestyle and supplementation.',
  lifestyle_recommendations: {
    diet: [
      'Increase soluble fibre (oats, legumes, apples) to help lower LDL cholesterol.',
      'Replace saturated fats with unsaturated fats — use olive oil, eat more oily fish, nuts, and avocado.',
      'Add Vitamin D-rich foods: salmon, fortified dairy or plant milks, and eggs.',
    ],
    exercise: [
      'Aim for 150 minutes of moderate aerobic exercise per week — even brisk walking significantly raises HDL.',
      'Incorporate resistance training 2× per week to support metabolic health.',
    ],
    sleep: [
      'Prioritise 7–9 hours of sleep; poor sleep is associated with lower HDL and elevated LDL.',
    ],
    stress: [
      'Chronic stress raises cortisol, which can negatively impact cholesterol. Consider mindfulness, yoga, or daily walks.',
    ],
  },
  urgent_flags: [
    'LDL Cholesterol is significantly elevated at 130 mg/dL (target < 100 mg/dL). Please discuss cardiovascular risk assessment with your doctor.',
  ],
  disclaimer: 'This analysis is for educational purposes only and is not a substitute for professional medical advice. Please consult with your healthcare provider before making any changes to your health routine.',
});

export const simulateProcessing = (
  onProgress: (stage: 'uploading' | 'extracting' | 'analyzing' | 'complete', progress: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let progress = 0;

    onProgress('uploading', 0);
    const uploadInterval = setInterval(() => {
      progress += 10;
      onProgress('uploading', progress);
      if (progress >= 25) {
        clearInterval(uploadInterval);

        onProgress('extracting', 25);
        const extractInterval = setInterval(() => {
          progress += 8;
          onProgress('extracting', progress);
          if (progress >= 60) {
            clearInterval(extractInterval);

            onProgress('analyzing', 60);
            const analyzeInterval = setInterval(() => {
              progress += 5;
              onProgress('analyzing', progress);
              if (progress >= 95) {
                clearInterval(analyzeInterval);
                setTimeout(() => {
                  onProgress('complete', 100);
                  resolve();
                }, 500);
              }
            }, 200);
          }
        }, 150);
      }
    }, 100);
  });
};
