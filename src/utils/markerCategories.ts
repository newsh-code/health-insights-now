export type MarkerCategory =
  | 'Haematology'
  | 'Liver Function'
  | 'Lipids'
  | 'Metabolic'
  | 'Thyroid'
  | 'Nutrients & Minerals'
  | 'Other';

// Each rule is [keywords[], category].
// Rules are checked IN ORDER — put more-specific rules before general ones
// (e.g. Metabolic before Haematology so "Hemoglobin A1c" → Metabolic, not Haematology).
const RULES: Array<[string[], MarkerCategory]> = [
  [
    [
      'sodium', 'potassium', 'chloride', 'bicarbonate', 'urea', 'creatinine', 'egfr',
      'glucose', 'hba1c', 'hemoglobin a1c', 'haemoglobin a1c',
    ],
    'Metabolic',
  ],
  [
    [
      'ast', 'alt', 'ggt', 'alkaline phosphatase', 'alp', 'bilirubin',
      'albumin', 'total protein', 'globulin',
    ],
    'Liver Function',
  ],
  [
    [
      'haemoglobin', 'hemoglobin', 'hgb', 'hct', 'haematocrit', 'hematocrit',
      'rbc', 'red blood cell', 'mcv', 'mchc', 'mch', 'rdw',
      'platelet', 'wbc', 'white blood cell',
      'neutrophil', 'lymphocyte', 'monocyte', 'eosinophil', 'basophil', 'esr',
    ],
    'Haematology',
  ],
  [
    ['cholesterol', 'hdl', 'ldl', 'triglyceride'],
    'Lipids',
  ],
  [
    ['tsh', 't3', 't4', 'thyroxine', 'triiodothyronine', 'thyroid'],
    'Thyroid',
  ],
  [
    [
      'calcium', 'phosphate', 'vitamin d', 'uric acid', 'ferritin', 'iron',
      'vitamin b12', 'b12', 'folate', 'folic acid', 'zinc', 'magnesium',
    ],
    'Nutrients & Minerals',
  ],
];

/**
 * Infer a panel category from a marker name.
 * Uses word-boundary matching so "AST" doesn't match inside "FAST".
 */
export function inferCategory(markerName: string): MarkerCategory {
  // Normalise: lowercase, replace punctuation with spaces
  const lower = markerName.toLowerCase().replace(/[-_/()\[\]]/g, ' ').replace(/\s+/g, ' ').trim();

  for (const [keywords, category] of RULES) {
    for (const kw of keywords) {
      const idx = lower.indexOf(kw);
      if (idx === -1) continue;
      // Keyword must be preceded by start-of-string or a space
      const before = idx === 0 || lower[idx - 1] === ' ';
      // Keyword must be followed by end-of-string, space, or a digit (e.g. "Vitamin D3")
      const afterChar = lower[idx + kw.length];
      const after = afterChar === undefined || afterChar === ' ' || /\d/.test(afterChar);
      if (before && after) return category;
    }
  }
  return 'Other';
}

export const CATEGORY_ORDER: MarkerCategory[] = [
  'Haematology',
  'Liver Function',
  'Lipids',
  'Metabolic',
  'Thyroid',
  'Nutrients & Minerals',
  'Other',
];
