export interface DrugInfo {
  name: string
  genericName: string
  category: string
  indications: string[]
  dosing: {
    route: string
    dose: string
    frequency: string
    maxDose?: string
    duration?: string
  }[]
  contraindications: string[]
  warnings: string[]
  ageRestrictions?: string
  weightRestrictions?: string
  renalAdjustment?: string
  hepaticAdjustment?: string
  monitoring?: string[]
  sideEffects: string[]
  interactions?: string[]
}

export interface MedicalSystem {
  id: string
  name: string
  description: string
  drugs: DrugInfo[]
}

export const PEDIATRIC_DRUG_DATABASE: MedicalSystem[] = [
  {
    id: 'cardiovascular',
    name: 'Cardiovascular System',
    description: 'Medications for heart conditions, hypertension, and vascular disorders',
    drugs: [
      {
        name: 'Digoxin',
        genericName: 'digoxin',
        category: 'Cardiac Glycoside',
        indications: ['Heart failure', 'Atrial fibrillation', 'Supraventricular tachycardia'],
        dosing: [
          {
            route: 'PO',
            dose: 'Loading: 8-12 mcg/kg/day divided q12h x 2 days; Maintenance: 3-5 mcg/kg/day',
            frequency: 'Once daily',
            maxDose: '250 mcg/day'
          },
          {
            route: 'IV',
            dose: 'Loading: 6-10 mcg/kg/day divided q12h x 2 days; Maintenance: 2-4 mcg/kg/day',
            frequency: 'Once daily',
            maxDose: '250 mcg/day'
          }
        ],
        contraindications: ['Ventricular fibrillation', 'Hypertrophic cardiomyopathy', 'Digitalis toxicity'],
        warnings: ['Monitor serum levels', 'Electrolyte imbalances increase toxicity', 'Renal impairment'],
        ageRestrictions: 'Use with caution in neonates',
        renalAdjustment: 'Reduce dose by 50% if CrCl <50 mL/min',
        monitoring: ['Serum digoxin levels', 'Electrolytes', 'Renal function', 'ECG'],
        sideEffects: ['Nausea', 'Vomiting', 'Arrhythmias', 'Visual disturbances']
      },
      {
        name: 'Furosemide',
        genericName: 'furosemide',
        category: 'Loop Diuretic',
        indications: ['Heart failure', 'Pulmonary edema', 'Hypertension', 'Fluid overload'],
        dosing: [
          {
            route: 'PO',
            dose: '1-2 mg/kg/dose',
            frequency: 'q6-12h',
            maxDose: '6 mg/kg/day'
          },
          {
            route: 'IV/IM',
            dose: '1 mg/kg/dose',
            frequency: 'q6-12h',
            maxDose: '6 mg/kg/day'
          }
        ],
        contraindications: ['Anuria', 'Severe electrolyte depletion'],
        warnings: ['Monitor electrolytes', 'Ototoxicity with high doses', 'Dehydration risk'],
        monitoring: ['Electrolytes', 'Renal function', 'Hearing', 'Blood pressure'],
        sideEffects: ['Hypokalemia', 'Hyponatremia', 'Dehydration', 'Ototoxicity']
      },
      {
        name: 'Captopril',
        genericName: 'captopril',
        category: 'ACE Inhibitor',
        indications: ['Heart failure', 'Hypertension', 'Post-MI'],
        dosing: [
          {
            route: 'PO',
            dose: 'Initial: 0.1-0.5 mg/kg/dose; Target: 0.5-2 mg/kg/dose',
            frequency: 'q8-12h',
            maxDose: '6 mg/kg/day'
          }
        ],
        contraindications: ['Bilateral renal artery stenosis', 'Pregnancy', 'Angioedema history'],
        warnings: ['First-dose hypotension', 'Hyperkalemia', 'Renal impairment'],
        monitoring: ['Blood pressure', 'Renal function', 'Electrolytes'],
        sideEffects: ['Cough', 'Hyperkalemia', 'Angioedema', 'Hypotension']
      },
      {
        name: 'Propranolol',
        genericName: 'propranolol',
        category: 'Beta Blocker',
        indications: ['Hypertension', 'Arrhythmias', 'Migraine prophylaxis', 'Tetralogy of Fallot spells'],
        dosing: [
          {
            route: 'PO',
            dose: '0.5-1 mg/kg/dose initially, increase to 2-4 mg/kg/dose',
            frequency: 'q6-8h',
            maxDose: '16 mg/kg/day'
          }
        ],
        contraindications: ['Asthma', 'Heart block', 'Cardiogenic shock'],
        warnings: ['Bronchospasm', 'Hypoglycemia masking', 'Withdrawal syndrome'],
        monitoring: ['Heart rate', 'Blood pressure', 'Blood glucose'],
        sideEffects: ['Bradycardia', 'Hypotension', 'Bronchospasm', 'Fatigue']
      },
      {
        name: 'Amlodipine',
        genericName: 'amlodipine',
        category: 'Calcium Channel Blocker',
        indications: ['Hypertension'],
        dosing: [
          {
            route: 'PO',
            dose: '0.1-0.2 mg/kg/day',
            frequency: 'Once daily',
            maxDose: '10 mg/day'
          }
        ],
        contraindications: ['Severe aortic stenosis'],
        warnings: ['Peripheral edema', 'Gingival hyperplasia'],
        monitoring: ['Blood pressure', 'Heart rate', 'Edema'],
        sideEffects: ['Peripheral edema', 'Flushing', 'Dizziness', 'Fatigue']
      },
      {
        name: 'Spironolactone',
        genericName: 'spironolactone',
        category: 'Potassium-Sparing Diuretic',
        indications: ['Heart failure', 'Hypertension', 'Primary aldosteronism'],
        dosing: [
          {
            route: 'PO',
            dose: '1-3 mg/kg/day',
            frequency: 'Once daily or divided q12h',
            maxDose: '100 mg/day'
          }
        ],
        contraindications: ['Hyperkalemia', 'Severe renal impairment'],
        warnings: ['Hyperkalemia', 'Gynecomastia', 'Menstrual irregularities'],
        monitoring: ['Electrolytes', 'Renal function'],
        sideEffects: ['Hyperkalemia', 'Gynecomastia', 'Menstrual irregularities']
      },
      {
        name: 'Enalapril',
        genericName: 'enalapril',
        category: 'ACE Inhibitor',
        indications: ['Heart failure', 'Hypertension'],
        dosing: [
          {
            route: 'PO',
            dose: '0.1-0.5 mg/kg/day',
            frequency: 'Once daily or divided q12h',
            maxDose: '40 mg/day'
          }
        ],
        contraindications: ['Bilateral renal artery stenosis', 'Pregnancy', 'Angioedema history'],
        warnings: ['First-dose hypotension', 'Hyperkalemia', 'Renal impairment'],
        monitoring: ['Blood pressure', 'Renal function', 'Electrolytes'],
        sideEffects: ['Cough', 'Hyperkalemia', 'Angioedema', 'Hypotension']
      },
      {
        name: 'Metoprolol',
        genericName: 'metoprolol',
        category: 'Beta-1 Selective Blocker',
        indications: ['Hypertension', 'Heart failure', 'Post-MI'],
        dosing: [
          {
            route: 'PO',
            dose: '1-2 mg/kg/day',
            frequency: 'Divided q12h',
            maxDose: '200 mg/day'
          }
        ],
        contraindications: ['Heart block', 'Cardiogenic shock', 'Severe bradycardia'],
        warnings: ['Bronchospasm', 'Hypoglycemia masking', 'Withdrawal syndrome'],
        monitoring: ['Heart rate', 'Blood pressure', 'Blood glucose'],
        sideEffects: ['Bradycardia', 'Hypotension', 'Fatigue', 'Dizziness']
      },
      {
        name: 'Hydrochlorothiazide',
        genericName: 'hydrochlorothiazide',
        category: 'Thiazide Diuretic',
        indications: ['Hypertension', 'Edema'],
        dosing: [
          {
            route: 'PO',
            dose: '1-2 mg/kg/day',
            frequency: 'Once daily',
            maxDose: '50 mg/day'
          }
        ],
        contraindications: ['Anuria', 'Severe renal impairment'],
        warnings: ['Hypokalemia', 'Hyperuricemia', 'Glucose intolerance'],
        monitoring: ['Electrolytes', 'Renal function', 'Blood glucose', 'Uric acid'],
        sideEffects: ['Hypokalemia', 'Hyperuricemia', 'Photosensitivity']
      },
      {
        name: 'Losartan',
        genericName: 'losartan',
        category: 'ARB (Angiotensin Receptor Blocker)',
        indications: ['Hypertension', 'Diabetic nephropathy'],
        dosing: [
          {
            route: 'PO',
            dose: '0.7-1.4 mg/kg/day',
            frequency: 'Once daily',
            maxDose: '100 mg/day'
          }
        ],
        contraindications: ['Pregnancy', 'Bilateral renal artery stenosis'],
        warnings: ['Hyperkalemia', 'Renal impairment', 'Hypotension'],
        monitoring: ['Blood pressure', 'Renal function', 'Electrolytes'],
        sideEffects: ['Hyperkalemia', 'Dizziness', 'Upper respiratory infection']
      },
      {
        name: 'Adenosine',
        genericName: 'adenosine',
        category: 'Antiarrhythmic',
        indications: ['Supraventricular tachycardia'],
        dosing: [
          {
            route: 'IV',
            dose: 'Initial: 0.1 mg/kg (max 6 mg); Second: 0.2 mg/kg (max 12 mg)',
            frequency: 'Single dose, may repeat once',
            maxDose: '12 mg'
          }
        ],
        contraindications: ['Second/third-degree heart block', 'Sick sinus syndrome', 'Asthma'],
        warnings: ['Transient asystole', 'Bronchospasm', 'Chest pain'],
        monitoring: ['ECG', 'Blood pressure', 'Respiratory status'],
        sideEffects: ['Chest pain', 'Dyspnea', 'Flushing', 'Transient asystole']
      },
      {
        name: 'Amiodarone',
        genericName: 'amiodarone',
        category: 'Class III Antiarrhythmic',
        indications: ['Life-threatening arrhythmias', 'Atrial fibrillation'],
        dosing: [
          {
            route: 'PO',
            dose: 'Loading: 10-15 mg/kg/day x 4-14 days; Maintenance: 5 mg/kg/day',
            frequency: 'Once daily',
            maxDose: '400 mg/day'
          },
          {
            route: 'IV',
            dose: 'Loading: 5 mg/kg over 10-60 min; Maintenance: 5-15 mcg/kg/min',
            frequency: 'Continuous infusion'
          }
        ],
        contraindications: ['Sinus node dysfunction', 'Second/third-degree heart block'],
        warnings: ['Pulmonary toxicity', 'Thyroid dysfunction', 'Hepatotoxicity'],
        monitoring: ['ECG', 'Thyroid function', 'Liver function', 'Pulmonary function'],
        sideEffects: ['Pulmonary fibrosis', 'Thyroid dysfunction', 'Photosensitivity']
      },
      {
        name: 'Lidocaine',
        genericName: 'lidocaine',
        category: 'Class IB Antiarrhythmic',
        indications: ['Ventricular arrhythmias'],
        dosing: [
          {
            route: 'IV',
            dose: 'Loading: 1-1.5 mg/kg; Maintenance: 20-50 mcg/kg/min',
            frequency: 'Continuous infusion'
          }
        ],
        contraindications: ['Complete heart block', 'Severe SA node dysfunction'],
        warnings: ['CNS toxicity', 'Cardiac depression', 'Seizures'],
        monitoring: ['ECG', 'Serum levels', 'Neurological status'],
        sideEffects: ['Dizziness', 'Confusion', 'Seizures', 'Cardiac depression']
      },
      {
        name: 'Verapamil',
        genericName: 'verapamil',
        category: 'Calcium Channel Blocker',
        indications: ['Supraventricular tachycardia', 'Hypertension'],
        dosing: [
          {
            route: 'PO',
            dose: '4-8 mg/kg/day',
            frequency: 'Divided q8h',
            maxDose: '480 mg/day'
          },
          {
            route: 'IV',
            dose: '0.1-0.3 mg/kg (max 5 mg)',
            frequency: 'Single dose, may repeat once'
          }
        ],
        contraindications: ['Heart failure', 'Second/third-degree heart block', 'Hypotension'],
        warnings: ['Negative inotropic effects', 'Constipation', 'Drug interactions'],
        ageRestrictions: 'Avoid IV use in infants <1 year',
        monitoring: ['ECG', 'Blood pressure', 'Heart rate'],
        sideEffects: ['Constipation', 'Hypotension', 'Bradycardia', 'Heart block']
      },
      {
        name: 'Isosorbide Dinitrate',
        genericName: 'isosorbide dinitrate',
        category: 'Nitrate Vasodilator',
        indications: ['Heart failure', 'Angina'],
        dosing: [
          {
            route: 'PO',
            dose: '0.5-1 mg/kg/dose',
            frequency: 'q6-8h',
            maxDose: '40 mg/dose'
          }
        ],
        contraindications: ['Severe hypotension', 'Increased intracranial pressure'],
        warnings: ['Tolerance development', 'Rebound angina', 'Hypotension'],
        monitoring: ['Blood pressure', 'Heart rate', 'Headache'],
        sideEffects: ['Headache', 'Hypotension', 'Dizziness', 'Flushing']
      },
      {
        name: 'Milrinone',
        genericName: 'milrinone',
        category: 'Phosphodiesterase Inhibitor',
        indications: ['Heart failure', 'Low cardiac output'],
        dosing: [
          {
            route: 'IV',
            dose: 'Loading: 50 mcg/kg over 10 min; Maintenance: 0.25-0.75 mcg/kg/min',
            frequency: 'Continuous infusion'
          }
        ],
        contraindications: ['Severe aortic stenosis', 'Hypertrophic cardiomyopathy'],
        warnings: ['Arrhythmias', 'Hypotension', 'Thrombocytopenia'],
        monitoring: ['ECG', 'Blood pressure', 'Platelet count', 'Renal function'],
        sideEffects: ['Arrhythmias', 'Hypotension', 'Headache', 'Thrombocytopenia']
      },
      {
        name: 'Dobutamine',
        genericName: 'dobutamine',
        category: 'Beta-1 Agonist',
        indications: ['Heart failure', 'Cardiogenic shock'],
        dosing: [
          {
            route: 'IV',
            dose: '2.5-15 mcg/kg/min',
            frequency: 'Continuous infusion'
          }
        ],
        contraindications: ['Hypertrophic cardiomyopathy', 'Pheochromocytoma'],
        warnings: ['Tachycardia', 'Arrhythmias', 'Hypertension'],
        monitoring: ['ECG', 'Blood pressure', 'Heart rate', 'Urine output'],
        sideEffects: ['Tachycardia', 'Arrhythmias', 'Hypertension', 'Chest pain']
      },
      {
        name: 'Dopamine',
        genericName: 'dopamine',
        category: 'Catecholamine',
        indications: ['Shock', 'Heart failure', 'Renal dysfunction'],
        dosing: [
          {
            route: 'IV',
            dose: '2-20 mcg/kg/min (dose-dependent effects)',
            frequency: 'Continuous infusion'
          }
        ],
        contraindications: ['Pheochromocytoma', 'Ventricular fibrillation'],
        warnings: ['Extravasation necrosis', 'Arrhythmias', 'Gangrene'],
        monitoring: ['ECG', 'Blood pressure', 'Urine output', 'IV site'],
        sideEffects: ['Tachycardia', 'Arrhythmias', 'Hypertension', 'Nausea']
      },
      {
        name: 'Epinephrine',
        genericName: 'epinephrine',
        category: 'Catecholamine',
        indications: ['Cardiac arrest', 'Anaphylaxis', 'Severe asthma'],
        dosing: [
          {
            route: 'IV/IO',
            dose: 'Cardiac arrest: 0.01 mg/kg (0.1 mL/kg of 1:10,000)',
            frequency: 'q3-5min during CPR'
          },
          {
            route: 'IM',
            dose: 'Anaphylaxis: 0.01 mg/kg (max 0.5 mg)',
            frequency: 'Single dose, may repeat'
          }
        ],
        contraindications: ['None in life-threatening situations'],
        warnings: ['Arrhythmias', 'Hypertension', 'Cerebral hemorrhage'],
        monitoring: ['ECG', 'Blood pressure', 'Heart rate'],
        sideEffects: ['Tachycardia', 'Hypertension', 'Anxiety', 'Tremor']
      },
      {
        name: 'Norepinephrine',
        genericName: 'norepinephrine',
        category: 'Catecholamine',
        indications: ['Septic shock', 'Severe hypotension'],
        dosing: [
          {
            route: 'IV',
            dose: '0.05-2 mcg/kg/min',
            frequency: 'Continuous infusion'
          }
        ],
        contraindications: ['Hypovolemia (uncorrected)', 'Mesenteric thrombosis'],
        warnings: ['Extravasation necrosis', 'Severe hypertension', 'Arrhythmias'],
        monitoring: ['ECG', 'Blood pressure', 'Urine output', 'IV site'],
        sideEffects: ['Hypertension', 'Bradycardia', 'Anxiety', 'Headache']
      }
    ]
  }


]

export const searchDrugsBySystem = (systemId: string): DrugInfo[] => {
  const system = PEDIATRIC_DRUG_DATABASE.find(s => s.id.toLowerCase() === systemId.toLowerCase())
  return system ? system.drugs : []
}

export const searchDrugsByIndication = (searchTerm: string): DrugInfo[] => {
  if (!searchTerm.trim()) return []
  const lowerSearchTerm = searchTerm.toLowerCase()
  const allDrugs: DrugInfo[] = PEDIATRIC_DRUG_DATABASE.flatMap(system => system.drugs)

  return allDrugs.filter(drug =>
    drug.indications.some(indication => indication.toLowerCase().includes(lowerSearchTerm)) ||
    drug.name.toLowerCase().includes(lowerSearchTerm) ||
    drug.genericName.toLowerCase().includes(lowerSearchTerm)
  )
}

export const calculateDrugDose = (
  drugNameOrGeneric: string,
  weightKg: number,
  ageYears: number,
  indication: string = 'general', // Default indication
  route: string = 'PO' // Default route
): any => { // Return type 'any' for now, can be refined to DrugCalculationResult
  const lowerDrugName = drugNameOrGeneric.toLowerCase()
  let foundDrug: DrugInfo | undefined
  let foundSystem: MedicalSystem | undefined

  for (const system of PEDIATRIC_DRUG_DATABASE) {
    const drug = system.drugs.find(d =>
      d.name.toLowerCase() === lowerDrugName ||
      d.genericName.toLowerCase() === lowerDrugName
    )
    if (drug) {
      foundDrug = drug
      foundSystem = system
      break
    }
  }

  if (!foundDrug || !foundSystem) {
    throw new Error(`Drug "${drugNameOrGeneric}" not found in the database.`)
  }

  // Attempt to find a dosing regimen that matches the route.
  // This is a simplified selection logic. Real-world scenarios might need more complex matching
  // based on indication, age, specific formulation, etc.
  const dosingInfo = foundDrug.dosing.find(d => d.route.toUpperCase().startsWith(route.toUpperCase()))

  if (!dosingInfo) {
    // Fallback to the first available dosing if specific route not found
    const fallbackDosing = foundDrug.dosing[0]
    if (!fallbackDosing) {
      throw new Error(`No dosing information available for "${foundDrug.name}" for route "${route}".`)
    }
    // Consider logging a warning if a fallback is used, or handle more gracefully.
    // For now, we'll use the first available dosing.
    // This part of the logic might need refinement based on clinical requirements.
    // For example, some drugs might not be substitutable by route.
    // console.warn(`Dosing for route "${route}" not found for ${foundDrug.name}. Using first available: ${fallbackDosing.route}`);
    // dosingInfo = fallbackDosing;
    // Temporarily throwing error if exact route match isn't found, can be adjusted
     throw new Error(`Specific dosing for route "${route}" not found for ${foundDrug.name}. Available routes: ${foundDrug.dosing.map(d=>d.route).join(', ')}.`);
  }

  // Placeholder for actual dose calculation logic.
  // This would involve parsing the 'dose' string (e.g., "1-2 mg/kg/dose")
  // and applying it to the weight. This is highly complex due to varied formats.
  // For this example, we'll return the dosing string directly.
  // A real implementation would need a robust parsing and calculation engine.

  return {
    drug: foundDrug.name,
    genericName: foundDrug.genericName,
    system: foundSystem.name,
    indication: indication, // Use the provided indication
    dosing: { // Return the matched dosing object
      route: dosingInfo.route,
      dose: dosingInfo.dose, // This is the string, not a calculated value yet
      frequency: dosingInfo.frequency,
      maxDose: dosingInfo.maxDose,
      duration: dosingInfo.duration,
    },
    contraindications: foundDrug.contraindications,
    warnings: foundDrug.warnings,
    monitoring: foundDrug.monitoring,
    sideEffects: foundDrug.sideEffects,
    ageRestrictions: foundDrug.ageRestrictions,
    renalAdjustment: foundDrug.renalAdjustment,
    hepaticAdjustment: foundDrug.hepaticAdjustment,
  }
}