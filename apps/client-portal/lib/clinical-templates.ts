export type ClinicalTemplate = {
  name: string;
  diagnosis: string;
  prescription: string;
  notes: string;
};

export const builtInClinicalTemplates: ClinicalTemplate[] = [
  {
    name: "ANC 1st Visit",
    diagnosis: "Pregnancy - 1st Trimester ANC",
    prescription: "Tab Folic Acid 5mg OD\nTab Iron 30mg OD\nTab Calcium 500mg BD\nVit D3 1000IU OD",
    notes: "LMP: __  EDD: __  Wt: __kg  BP: __\nUrine D/R: Normal  HB: __\nAdvice: Rest, nutrition, avoid heavy work\nNext visit: 4 weeks",
  },
  {
    name: "ANC 2nd Trimester",
    diagnosis: "Pregnancy - 2nd Trimester ANC Visit",
    prescription: "Tab Iron 60mg OD\nTab Folic Acid 5mg OD\nTab Calcium 500mg BD\nTab B-Complex OD",
    notes: "Wt: __kg  BP: __  FHR: __\nFundal Height: __ cm\nUSG anomaly scan advised\nNext visit: 4 weeks",
  },
  {
    name: "ANC 3rd Trimester",
    diagnosis: "Pregnancy - 3rd Trimester ANC Visit",
    prescription: "Tab Iron 60mg OD\nTab Calcium 500mg BD\nTab Folic Acid 5mg OD\nSyrup Lactulose 15ml BD if required",
    notes: "Wt: __kg  BP: __  FHR: __\nPresentation: Cephalic/Breech\nGrowth scan advised\nNext visit: 2 weeks",
  },
  {
    name: "PCOS Review",
    diagnosis: "Polycystic Ovary Syndrome (PCOS)",
    prescription: "Tab Metformin 500mg BD with meals\nTab Folic Acid 5mg OD\nVit D3 5000IU weekly",
    notes: "Wt: __kg  BMI: __  BP: __\nCycle: Irregular/Regular  LMP: __\nAdvice: Weight reduction, exercise, low carb diet\nReview in 3 months",
  },
  {
    name: "Postnatal Visit",
    diagnosis: "Postnatal Follow-up",
    prescription: "Tab Iron 60mg OD\nTab Calcium 500mg BD\nTab Folic Acid 5mg OD",
    notes: "Wt: __kg  BP: __\nBreastfeeding: Yes/No\nContraception counselling completed\nReview in 3 months",
  },
  {
    name: "Menstrual Disorder",
    diagnosis: "Menstrual Irregularity / Dysmenorrhea",
    prescription: "Tab Mefenamic Acid 500mg TDS Day 1-3\nTab Tranexamic Acid 500mg TDS if heavy\nTab Iron 60mg OD",
    notes: "LMP: __  Cycle Length: __ days\nFlow: Heavy/Normal/Light\nUSG: __\nReview after next cycle",
  },
];

export function getTemplateByName(name?: string | null) {
  if (!name) return null;
  return builtInClinicalTemplates.find((template) => template.name.toLowerCase() === name.toLowerCase()) ?? null;
}

