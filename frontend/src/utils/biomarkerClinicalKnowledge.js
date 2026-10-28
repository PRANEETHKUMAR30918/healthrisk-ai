/**
 * Biomarker Clinical Knowledge Base
 * For each biomarker: highDisadvantages, lowDisadvantages, suddenIncreaseReasons, suddenDecreaseReasons
 */

export const BIOMARKER_CLINICAL_KNOWLEDGE = {
  // ─── DIABETES & GLUCOSE ───────────────────────────────────────────────────
  'HbA1c': {
    highDisadvantages: [
      'Sustained high blood sugar damages small blood vessels (microvascular disease)',
      'Risk of diabetic retinopathy — can cause blurred vision or blindness',
      'Nerve damage (peripheral neuropathy) — tingling, numbness, pain in hands & feet',
      'Diabetic kidney disease (nephropathy) — progressive loss of kidney filtering ability',
      'Increased risk of heart attack and stroke (2–4× higher risk)',
      'Poor wound healing and increased risk of infections',
      'Risk of diabetic ketoacidosis (DKA) — a life-threatening emergency',
      'Accelerated ageing of arteries (atherosclerosis)',
    ],
    lowDisadvantages: [
      'Hypoglycemia risk — sudden low blood sugar can cause fainting, seizures, or coma',
      'May indicate haemolytic anaemia or rapid red blood cell turnover (falsely low)',
      'In diabetics on medication: suggests possible overmedication or missed meals',
      'Brain fog, confusion, and difficulty concentrating',
      'Shakiness, cold sweats, and palpitations from low glucose episodes',
    ],
    suddenIncreaseReasons: [
      'High-carbohydrate or high-sugar diet over the past 3 months',
      'Missed or skipped diabetes medications (metformin, insulin, GLP-1 agents)',
      'Severe emotional or physical stress elevating cortisol and blood sugar',
      'Systemic infection, surgery, or illness (glucose rises during illness)',
      'Use of corticosteroids (prednisolone, dexamethasone) — strongly raise blood glucose',
      'Thyroid disorder (hypothyroidism raises HbA1c)',
      'New or worsening insulin resistance from weight gain or sedentary lifestyle',
      'Iron deficiency anaemia (can falsely elevate HbA1c readings)',
    ],
    suddenDecreaseReasons: [
      'Newly started or intensified diabetes medications (insulin, metformin, SGLT2i, GLP-1)',
      'Significant dietary change — low-carb or caloric restriction diet adopted',
      'Increased physical exercise improving insulin sensitivity',
      'Haemolytic anaemia or rapid red cell breakdown (shortens red cell lifespan, falsely lowers HbA1c)',
      'Recent blood transfusion (new red cells not yet glycated)',
      'Significant weight loss (improves insulin sensitivity dramatically)',
      'Vitamin E or vitamin C supplementation (minor artifactual reduction)',
    ],
  },

  'Fasting Blood Glucose': {
    highDisadvantages: [
      'Indicator of pre-diabetes or type 2 diabetes if persistently elevated',
      'Damages blood vessel walls causing atherosclerosis and heart disease',
      'Increased oxidative stress and systemic inflammation',
      'Impaired immune response — higher risk of bacterial and fungal infections',
      'Progressive kidney damage if unmanaged',
    ],
    lowDisadvantages: [
      'Hypoglycemia — dizziness, confusion, fainting, and potential seizures',
      'Brain energy deficit — the brain relies almost exclusively on glucose',
      'Excessive sweating, trembling, and racing heart',
      'May indicate insulinoma (insulin-secreting tumour) if recurrent',
      'Risk of hypoglycemic coma if severely low',
    ],
    suddenIncreaseReasons: [
      'Eating late at night or consuming high-sugar foods before the test',
      'Acute illness, infection, or physical trauma raising stress hormones',
      'Starting corticosteroid or antipsychotic medication',
      'Extreme psychological stress or anxiety',
      'Insufficient sleep the night before the test',
    ],
    suddenDecreaseReasons: [
      'Prolonged fasting for longer than usual before the test',
      'Excessive exercise without adequate carbohydrate intake',
      'Overmedication with insulin or sulfonylureas',
      'Alcohol consumption prior to testing (suppresses hepatic glucose output)',
    ],
  },

  // ─── LIPIDS & CARDIOVASCULAR ──────────────────────────────────────────────
  'Total Cholesterol': {
    highDisadvantages: [
      'Plaque buildup in arteries (atherosclerosis) narrowing blood flow',
      'Increased risk of coronary artery disease and heart attack',
      'Higher risk of ischaemic stroke',
      'Peripheral artery disease — poor circulation in legs',
      'Risk of gallstones (cholesterol-rich bile)',
    ],
    lowDisadvantages: [
      'Increased risk of haemorrhagic stroke (low cholesterol weakens blood vessel walls)',
      'Hormonal disruption — cholesterol is a precursor for all steroid hormones (cortisol, oestrogen, testosterone)',
      'Impaired absorption of fat-soluble vitamins (A, D, E, K)',
      'Possible liver disease or malnutrition if very low',
      'Mental health issues — low cholesterol linked to depression and anxiety',
    ],
    suddenIncreaseReasons: [
      'Diet high in saturated fats (red meat, full-fat dairy, processed foods)',
      'Weight gain or increased body fat',
      'Hypothyroidism (TSH rises, cholesterol follows)',
      'Stopping statin medication',
      'Pregnancy or hormonal changes',
      'Uncontrolled diabetes',
    ],
    suddenDecreaseReasons: [
      'Starting a statin (atorvastatin, rosuvastatin) or other cholesterol medication',
      'Adopting a low-fat plant-based diet',
      'Significant weight loss',
      'Hyperthyroidism (increases cholesterol clearance)',
      'Severe illness or infection consuming fat stores',
    ],
  },

  'LDL': {
    highDisadvantages: [
      'LDL ("bad cholesterol") directly deposits in arterial walls forming plaques',
      'Arterial plaque rupture can cause sudden heart attack or stroke',
      'Carotid artery narrowing raising stroke risk',
      'Silent coronary artery disease (can be asymptomatic for years)',
      'Accelerates peripheral vascular disease',
    ],
    lowDisadvantages: [
      'Impaired cell membrane formation (LDL carries cholesterol to every cell)',
      'Potential hormonal imbalances — reduced steroid hormone synthesis',
      'Very low LDL linked to increased cancer risk and haemorrhagic stroke in some studies',
    ],
    suddenIncreaseReasons: [
      'High saturated fat or trans-fat consumption',
      'Stopped or skipped statin/lipid medication',
      'Hypothyroidism — TSH elevation raises LDL',
      'Diabetes — especially poorly controlled type 2 diabetes',
      'Genetic familial hypercholesterolaemia (FH)',
    ],
    suddenDecreaseReasons: [
      'New statin therapy or dose increase',
      'Ezetimibe or PCSK9 inhibitor introduction',
      'Low-fat or Mediterranean diet',
      'Intensive aerobic exercise programme',
    ],
  },

  'HDL': {
    highDisadvantages: [
      'Extremely high HDL (>100 mg/dL) — some studies link to increased heart risk paradoxically',
      'Dysfunctional HDL in inflammatory states loses its protective benefit',
    ],
    lowDisadvantages: [
      'Low HDL is a major independent risk factor for heart disease',
      'Reduced reverse cholesterol transport — LDL not cleared from arterial walls',
      'Increased risk of metabolic syndrome',
      'Higher risk of type 2 diabetes development',
      'Reduced anti-inflammatory protection for blood vessels',
    ],
    suddenIncreaseReasons: [
      'Regular aerobic exercise (running, swimming, cycling)',
      'Moderate alcohol consumption (controversial)',
      'Niacin (vitamin B3) supplementation',
      'Quitting smoking',
    ],
    suddenDecreaseReasons: [
      'New smoking habit or increased smoking',
      'Physical inactivity and sedentary lifestyle',
      'High-carbohydrate processed diet (trans-fats lower HDL)',
      'Obesity and weight gain',
      'Beta-blocker medication use',
      'Uncontrolled diabetes or metabolic syndrome',
    ],
  },

  'Triglycerides': {
    highDisadvantages: [
      'Risk of pancreatitis (inflammation of the pancreas) — can be life-threatening if very high',
      'Contributes to atherosclerosis and heart disease',
      'Associated with metabolic syndrome and insulin resistance',
      'Increased risk of non-alcoholic fatty liver disease (NAFLD)',
      'Contributes to "small dense LDL" — the most dangerous form of LDL',
    ],
    lowDisadvantages: [
      'May indicate malabsorption syndromes or hyperthyroidism',
      'Very low values are usually not a direct concern unless associated with malnutrition',
    ],
    suddenIncreaseReasons: [
      'High-sugar diet, fruit juice, alcohol, or refined carbohydrates',
      'Excessive alcohol intake (liver converts alcohol to triglycerides)',
      'Uncontrolled diabetes or newly developed insulin resistance',
      'Hypothyroidism',
      'Kidney disease (nephrotic syndrome)',
      'Certain medications: beta-blockers, retinoids, steroids, antipsychotics',
    ],
    suddenDecreaseReasons: [
      'Adopting a low-carbohydrate or ketogenic diet',
      'Starting omega-3 fatty acid supplementation (fish oil)',
      'Starting fibrate medication (fenofibrate)',
      'Abstaining from alcohol',
      'Increased physical exercise',
    ],
  },

  // ─── KIDNEY FUNCTION ──────────────────────────────────────────────────────
  'Serum Creatinine': {
    highDisadvantages: [
      'Indicates reduced kidney filtering — potential chronic kidney disease (CKD)',
      'Accumulation of waste products in blood (uraemia) causing fatigue and nausea',
      'Fluid retention, swelling (oedema) in legs and ankles',
      'Hypertension from kidney dysfunction',
      'Anaemia from reduced erythropoietin production by failing kidneys',
      'Risk of electrolyte imbalances (hyperkalaemia, acidosis)',
      'If untreated — risk of progression to end-stage kidney disease requiring dialysis',
    ],
    lowDisadvantages: [
      'Very low creatinine often seen in muscle wasting conditions (sarcopenia)',
      'Can indicate low muscle mass, malnutrition, or advanced liver disease',
      'Falsely reassuring kidney function in elderly or frail patients',
    ],
    suddenIncreaseReasons: [
      'Dehydration — reduced fluid intake concentrates creatinine',
      'Acute kidney injury (AKI) from medication (NSAIDs, ibuprofen, contrast dyes)',
      'New urinary tract obstruction',
      'Severe infection or sepsis reducing kidney blood flow',
      'Starting ACE inhibitor or ARB medication (initial slight creatinine rise expected)',
      'Rhabdomyolysis (muscle breakdown from extreme exercise or crush injury)',
      'High-protein diet or creatine supplementation',
    ],
    suddenDecreaseReasons: [
      'Improved hydration restoring kidney blood flow',
      'Resolution of acute kidney injury',
      'Muscle loss from illness or inactivity (less creatinine produced)',
      'Very low protein diet',
    ],
  },

  'eGFR': {
    highDisadvantages: [
      'An extremely high eGFR alone is rarely clinically significant',
      'In early diabetes, hyperfiltration (high eGFR) can be an early sign of kidney stress',
    ],
    lowDisadvantages: [
      'eGFR <60: Chronic Kidney Disease (CKD) — requires nephrology evaluation',
      'eGFR <30: Severely reduced kidney function — risk of uraemia, acidosis, hyperkalaemia',
      'eGFR <15: Near kidney failure — dialysis or transplant may be needed',
      'Fatigue, itching, nausea from toxin accumulation',
      'Uncontrolled high blood pressure worsening kidney damage',
      'Bone disease from impaired vitamin D activation by failing kidneys',
    ],
    suddenIncreaseReasons: [
      'Better hydration improving kidney blood flow',
      'Resolution of acute illness or infection',
      'Blood pressure normalisation',
    ],
    suddenDecreaseReasons: [
      'Dehydration, diuretic overuse',
      'New nephrotoxic medication (NSAIDs, aminoglycosides, contrast agents)',
      'Acute urinary obstruction (kidney stones)',
      'Worsening diabetes or hypertension affecting kidney perfusion',
      'Systemic illness or surgery reducing kidney blood flow',
    ],
  },

  // ─── LIVER FUNCTION ───────────────────────────────────────────────────────
  'ALT': {
    highDisadvantages: [
      'ALT is a liver-specific enzyme — high levels indicate liver cell damage',
      'Possible non-alcoholic fatty liver disease (NAFLD/NASH)',
      'Risk of hepatitis (viral, autoimmune, or drug-induced)',
      'Cirrhosis risk if chronically elevated without treatment',
      'Liver cancer risk with sustained inflammation',
      'Impaired detoxification of drugs and toxins',
    ],
    lowDisadvantages: [
      'Extremely low ALT can be seen in malnutrition or vitamin B6 deficiency',
      'Rarely clinically significant on its own',
    ],
    suddenIncreaseReasons: [
      'Heavy alcohol intake in the days before the test',
      'Starting a new medication (statins, paracetamol/acetaminophen, antibiotics)',
      'Viral hepatitis A, B, or C infection',
      'Recent intense exercise (minor elevation from muscle cells)',
      'Non-alcoholic steatohepatitis (NASH) flare from diet changes',
      'Autoimmune hepatitis flare',
    ],
    suddenDecreaseReasons: [
      'Abstaining from alcohol',
      'Discontinuing hepatotoxic medication',
      'Treatment of hepatitis infection',
      'Weight loss and improved diet normalising fatty liver',
    ],
  },

  'AST': {
    highDisadvantages: [
      'Found in liver, heart, muscle, and red blood cells — less liver-specific than ALT',
      'High AST with high ALT together confirms liver damage',
      'Very high AST alone may indicate heart attack, rhabdomyolysis, or haemolysis',
      'Chronic elevation suggests cirrhosis or advanced liver fibrosis',
    ],
    lowDisadvantages: [
      'Vitamin B6 deficiency can lower AST (B6 is required for AST enzyme function)',
      'Rarely clinically significant on its own',
    ],
    suddenIncreaseReasons: [
      'Alcohol binge drinking',
      'Heart attack (myocardial infarction)',
      'Intense or unusual physical exertion or muscle injury',
      'Drug-induced liver injury (especially paracetamol overdose)',
      'Acute viral hepatitis',
    ],
    suddenDecreaseReasons: [
      'Vitamin B6 (pyridoxine) supplementation',
      'Reduction of alcohol or hepatotoxic drug use',
    ],
  },

  'Bilirubin': {
    highDisadvantages: [
      'Jaundice — yellowing of skin and eyes (visible at bilirubin >2.5 mg/dL)',
      'Itching (pruritus) from bile salt deposits in skin',
      'Dark urine and pale stools indicating bile flow obstruction',
      'Indicates liver disease (hepatitis, cirrhosis), haemolysis, or bile duct blockage',
      'Neonatal high bilirubin — kernicterus (brain damage) risk in newborns',
      'Risk of gallstones',
    ],
    lowDisadvantages: [
      'Very low bilirubin is generally not a health concern',
      'Extreme overhydration can mildly dilute bilirubin',
    ],
    suddenIncreaseReasons: [
      'Haemolysis — rapid red blood cell destruction (sickle cell crisis, transfusion reaction)',
      'Gallstone blocking common bile duct',
      'Acute hepatitis or liver inflammation flare',
      'Sepsis or severe infection impairing liver function',
      'New hepatotoxic medication',
      'Gilbert syndrome (benign, caused by fasting or illness)',
    ],
    suddenDecreaseReasons: [
      'Resolution of haemolytic episode',
      'Surgical removal of bile duct obstruction',
      'Treatment of underlying hepatitis or liver disease',
    ],
  },

  // ─── THYROID ──────────────────────────────────────────────────────────────
  'TSH': {
    highDisadvantages: [
      'High TSH = underactive thyroid (hypothyroidism)',
      'Fatigue, cold intolerance, weight gain, constipation, dry skin, hair loss',
      'Depression, brain fog, memory difficulties',
      'Elevated cholesterol and increased cardiovascular risk from hypothyroidism',
      'Menstrual irregularities and fertility problems in women',
      'Myxoedema coma (rare severe hypothyroidism) — medical emergency',
    ],
    lowDisadvantages: [
      'Low TSH = overactive thyroid (hyperthyroidism)',
      'Rapid heart rate, palpitations, atrial fibrillation risk',
      'Unintended weight loss despite normal or increased appetite',
      'Anxiety, irritability, tremors, difficulty sleeping',
      'Heat intolerance and excessive sweating',
      'Bone loss (osteoporosis) from excess thyroid hormone over time',
      'Eye disease (Graves ophthalmopathy)',
    ],
    suddenIncreaseReasons: [
      'Iodine deficiency worsening underlying hypothyroidism',
      'Stopping thyroid hormone replacement (levothyroxine)',
      'Starting lithium, amiodarone, or interferon (suppress thyroid)',
      'Hashimoto thyroiditis flare',
      'Recent iodine contrast dye exposure causing thyroid disruption',
    ],
    suddenDecreaseReasons: [
      'New or increased levothyroxine (T4) dose',
      'Graves disease causing sudden hyperthyroidism',
      'Postpartum thyroiditis — initial hyperthyroid phase',
      'Amiodarone-induced hyperthyroidism',
      'TSH-secreting pituitary tumour suppression',
    ],
  },

  'Free T3': {
    highDisadvantages: [
      'Hyperthyroid symptoms: rapid heartbeat, anxiety, weight loss, tremors',
      'Thyroid storm risk (life-threatening acute hyperthyroidism)',
      'Bone density loss from sustained elevation',
    ],
    lowDisadvantages: [
      'Active hypothyroid symptoms: fatigue, cold intolerance, depression',
      'May indicate severe non-thyroidal illness (euthyroid sick syndrome)',
      'Impaired metabolism and energy production',
    ],
    suddenIncreaseReasons: [
      'Graves disease triggering thyroid overactivity',
      'T3 supplementation or excessive iodine intake',
      'Rapid conversion from stored T4 (during physiological stress)',
    ],
    suddenDecreaseReasons: [
      'Severe systemic illness reducing T4 to T3 conversion',
      'Antithyroid drugs (methimazole, propylthiouracil) working effectively',
      'Low selenium status (selenium required for T4 to T3 conversion)',
    ],
  },

  'Free T4': {
    highDisadvantages: [
      'Hyperthyroidism complications including atrial fibrillation and bone loss',
      'Amiodarone toxicity can raise free T4 significantly',
    ],
    lowDisadvantages: [
      'Central hypothyroidism (pituitary or hypothalamus failure)',
      'Secondary fatigue, weight gain, and cold intolerance',
      'May coexist with low TSH in severe illness (pituitary failure)',
    ],
    suddenIncreaseReasons: [
      'New Graves disease or toxic goitre',
      'Subacute thyroiditis (inflammation releasing stored T4)',
      'Amiodarone drug use',
      'Taking too much levothyroxine',
    ],
    suddenDecreaseReasons: [
      'Stopping levothyroxine medication',
      'Pituitary disease reducing TSH (which drives T4 production)',
      'Severe caloric restriction or malnutrition',
    ],
  },

  // ─── BLOOD COUNT ──────────────────────────────────────────────────────────
  'Hemoglobin': {
    highDisadvantages: [
      'Polycythaemia — blood thickens, increasing risk of blood clots (DVT, stroke)',
      'Increased blood pressure from high viscosity',
      'Headaches, dizziness, flushing',
      'Possible polycythaemia vera (bone marrow overproduction disorder)',
      'Dehydration artificially raises haemoglobin — risk of clots',
    ],
    lowDisadvantages: [
      'Anaemia — reduced oxygen delivery to all organs and tissues',
      'Persistent fatigue, shortness of breath, and weakness',
      'Rapid heart rate (compensatory) placing strain on the heart',
      'Cognitive impairment and difficulty concentrating',
      'Increased risk of complications during surgery',
      'In severe anaemia — heart failure from chronic oxygen deficit',
    ],
    suddenIncreaseReasons: [
      'Dehydration (concentrated blood)',
      'Living at high altitude (body compensates with more red cells)',
      'Erythropoietin (EPO) use or erythrocytosis',
      'Smoking (relative polycythaemia from CO exposure)',
    ],
    suddenDecreaseReasons: [
      'Acute blood loss (injury, surgery, heavy menstruation)',
      'Iron deficiency from poor diet or malabsorption',
      'Vitamin B12 or folate deficiency',
      'Haemolysis — immune, mechanical, or medication-triggered red cell destruction',
      'Chronic kidney disease (reduced erythropoietin)',
      'Bone marrow suppression from chemotherapy or aplastic anaemia',
    ],
  },

  'RBC': {
    highDisadvantages: [
      'Increased blood clot risk (thrombosis) from hyperviscosity',
      'Headaches, visual disturbances, and hypertension',
    ],
    lowDisadvantages: [
      'Anaemia — insufficient red cells to carry adequate oxygen',
      'Chronic fatigue, pallor, shortness of breath',
    ],
    suddenIncreaseReasons: [
      'Severe dehydration',
      'Polycythaemia vera or erythropoietin misuse',
    ],
    suddenDecreaseReasons: [
      'Acute haemorrhage or blood loss',
      'Haemolytic anaemia (autoimmune, mechanical)',
      'Iron/B12/folate deficiency',
      'Bone marrow failure',
    ],
  },

  'WBC': {
    highDisadvantages: [
      'High WBC (leukocytosis) often signals active infection or inflammation',
      'May indicate leukaemia (blood cancer) if very high without infection',
      'Extreme leukocytosis can cause hyperviscosity and blood flow problems (leukostasis)',
      'Chronic steroids, smoking, or stress elevate WBC',
    ],
    lowDisadvantages: [
      'Leukopenia — severely reduced immune defence against infection',
      'Increased susceptibility to bacterial, viral, and fungal infections',
      'Chemotherapy-induced neutropenia — critical infection risk',
      'Possible autoimmune bone marrow suppression',
    ],
    suddenIncreaseReasons: [
      'Acute bacterial or viral infection',
      'Physical or emotional stress (cortisol releases WBCs into circulation)',
      'New corticosteroid medication',
      'Allergic reaction',
      'Strenuous exercise',
    ],
    suddenDecreaseReasons: [
      'Chemotherapy or radiation therapy',
      'Viral infections (HIV, EBV, influenza) suppressing bone marrow',
      'Autoimmune conditions (lupus, rheumatoid arthritis)',
      'Certain medications (sulfonamides, carbimazole)',
    ],
  },

  'Platelets': {
    highDisadvantages: [
      'Thrombocytosis — excess platelets increase blood clot risk',
      'Risk of deep vein thrombosis (DVT), pulmonary embolism',
      'Stroke risk from arterial clots',
      'Essential thrombocythaemia (bone marrow overproduction disorder)',
    ],
    lowDisadvantages: [
      'Thrombocytopenia — insufficient platelets for normal clotting',
      'Easy bruising, petechiae (small red spots under skin)',
      'Prolonged bleeding from minor cuts',
      'Risk of spontaneous internal bleeding if very low (<20,000)',
      'Immune thrombocytopenic purpura (ITP) — immune attack on platelets',
    ],
    suddenIncreaseReasons: [
      'Iron deficiency anaemia (reactive thrombocytosis)',
      'Acute infection or inflammation (reactive)',
      'After splenectomy (spleen no longer removes old platelets)',
      'Post-surgery stress response',
    ],
    suddenDecreaseReasons: [
      'Immune attack on platelets (ITP, drug-induced)',
      'Viral infections (dengue, HIV, hepatitis C)',
      'Heparin-induced thrombocytopenia (HIT) — dangerous side effect',
      'Bone marrow failure or leukaemia',
      'Disseminated intravascular coagulation (DIC) — consuming platelets rapidly',
    ],
  },

  // ─── VITAMINS & MINERALS ─────────────────────────────────────────────────
  'Vitamin D': {
    highDisadvantages: [
      'Vitamin D toxicity (hypervitaminosis D) from excessive supplementation',
      'Hypercalcaemia — too much calcium in blood causing nausea, vomiting, confusion',
      'Kidney stones from excess calcium excretion',
      'Bone pain paradoxically from calcium dysregulation',
    ],
    lowDisadvantages: [
      'Osteoporosis and increased fracture risk',
      'Impaired calcium absorption from the gut',
      'Muscle weakness and pain (myopathy)',
      'Weakened immune system — increased respiratory infections',
      'Seasonal depression and mood changes linked to low Vitamin D',
      'In children: rickets (soft, deformed bones)',
      'Increased risk of autoimmune diseases (MS, type 1 diabetes)',
    ],
    suddenIncreaseReasons: [
      'High-dose vitamin D supplementation started',
      'Excessive sun exposure over several weeks',
    ],
    suddenDecreaseReasons: [
      'Reduced sun exposure (winter, indoor lifestyle, sunscreen use)',
      'Malabsorption conditions (coeliac disease, Crohn disease)',
      'Kidney disease (cannot convert vitamin D to active form)',
      'Liver disease (impairs initial vitamin D hydroxylation)',
      'Stopping vitamin D supplements',
    ],
  },

  'Vitamin B12': {
    highDisadvantages: [
      'Very high B12 can indicate liver disease (B12 stored in liver)',
      'May signal myeloproliferative disorders (blood cancers)',
      'Excess B12 supplementation is usually excreted — rarely toxic at high doses',
    ],
    lowDisadvantages: [
      'Megaloblastic anaemia — large, dysfunctional red cells',
      'Irreversible peripheral neuropathy — numbness, tingling, weakness in hands and feet',
      'Subacute combined degeneration of spinal cord if severely deficient',
      'Cognitive decline, memory loss, and dementia risk',
      'Depression, mood changes, and fatigue',
      'Elevated homocysteine — independent heart disease risk factor',
    ],
    suddenIncreaseReasons: [
      'B12 injection or high-dose oral supplementation',
      'Liver disease releasing stored B12 into blood',
    ],
    suddenDecreaseReasons: [
      'Vegan or strict vegetarian diet (B12 only in animal products)',
      'Pernicious anaemia (autoimmune destruction of intrinsic factor needed for B12 absorption)',
      'Prolonged metformin use (reduces B12 absorption in gut)',
      'Gastrointestinal surgery (stomach bypass reduces intrinsic factor)',
      'Alcohol abuse interfering with B12 absorption',
    ],
  },

  'Calcium': {
    highDisadvantages: [
      'Hypercalcaemia — nausea, vomiting, abdominal pain, constipation',
      'Kidney stones (calcium oxalate stones)',
      'Bone pain from calcium leaving bones (e.g., due to parathyroid tumour)',
      'Muscle weakness and fatigue',
      'Cardiac arrhythmias in severe hypercalcaemia',
      'Neuropsychiatric symptoms: depression, confusion, psychosis',
      'May indicate hyperparathyroidism or malignancy (cancer releasing PTH-like protein)',
    ],
    lowDisadvantages: [
      'Muscle cramps, spasms, and tetany (uncontrolled muscle contractions)',
      'Numbness and tingling around mouth and in hands and feet',
      'Seizures in severe hypocalcaemia',
      'Brittle, weak bones increasing fracture risk',
      'Dental problems and tooth decay',
      'Cardiac arrhythmia (QT prolongation) risk',
    ],
    suddenIncreaseReasons: [
      'Hyperparathyroidism (parathyroid gland overactivity)',
      'Cancer spreading to bones or secreting PTH-related protein',
      'Excessive calcium or vitamin D supplementation',
      'Thiazide diuretics reducing calcium excretion',
      'Immobilisation (calcium leaving bones)',
    ],
    suddenDecreaseReasons: [
      'Vitamin D deficiency (calcium not absorbed from gut)',
      'Hypoparathyroidism (post-surgery thyroid/parathyroid removal)',
      'Acute pancreatitis (calcium deposited at site of inflammation)',
      'Magnesium deficiency (required for PTH function)',
      'Massive blood transfusion (citrate binding calcium)',
    ],
  },

  'Potassium': {
    highDisadvantages: [
      'Hyperkalaemia — severe cardiac risk including potentially fatal arrhythmia',
      'Muscle weakness and paralysis',
      'ECG changes (tall T-waves, widened QRS) — cardiac emergency if very high',
      'Gastrointestinal symptoms: nausea, abdominal cramps',
    ],
    lowDisadvantages: [
      'Hypokalaemia — muscle cramps, weakness, and fatigue',
      'Cardiac arrhythmia (irregular heartbeat)',
      'Constipation and gut muscle weakness',
      'If severe: muscle paralysis and respiratory failure',
      'Worsens cardiac glycoside (digoxin) toxicity',
    ],
    suddenIncreaseReasons: [
      'Acute kidney injury (cannot excrete potassium)',
      'ACE inhibitor or ARB + potassium supplement combination',
      'Potassium-sparing diuretics (spironolactone, amiloride)',
      'Rhabdomyolysis (potassium leaking from damaged muscle cells)',
      'Acidosis (hydrogen ions exchange into cells pushing potassium out)',
      'Haemolysis (potassium released from red cells)',
    ],
    suddenDecreaseReasons: [
      'Diuretic use (furosemide, thiazide) increasing urinary potassium loss',
      'Prolonged vomiting or nasogastric suction',
      'Severe diarrhoea',
      'Insufficient dietary potassium intake (low fruit/vegetable intake)',
      'Insulin therapy shifting potassium into cells',
      'Refeeding syndrome after starvation',
    ],
  },

  'Sodium': {
    highDisadvantages: [
      'Hypernatraemia — brain cell shrinkage causing confusion, seizures, and coma',
      'Chronic high sodium: hypertension and heart failure risk',
      'Thirst, dry mucous membranes, concentrated dark urine',
      'Worsens existing kidney disease',
    ],
    lowDisadvantages: [
      'Hyponatraemia — brain cell swelling causing headache, nausea, confusion',
      'Severe hyponatraemia: seizures, coma, and death if untreated',
      'Muscle cramps and weakness',
      'Falls and fracture risk in elderly (confusion)',
    ],
    suddenIncreaseReasons: [
      'Dehydration from fever, sweating, or inadequate fluid intake',
      'Diabetes insipidus (unable to retain water)',
      'Excess sodium intake with limited water',
      'Loop diuretic use with inadequate fluid replacement',
    ],
    suddenDecreaseReasons: [
      'Excessive water intake (overhydration)',
      'SIADH (syndrome of inappropriate ADH secretion) from medications, illness, or CNS conditions',
      'Hypothyroidism or adrenal insufficiency',
      'Diuretics causing sodium + water loss',
      'Heart failure or cirrhosis with water retention diluting sodium',
    ],
  },

  'Uric Acid': {
    highDisadvantages: [
      'Gout — extremely painful uric acid crystal deposits in joints (especially big toe)',
      'Uric acid kidney stones',
      'Chronic gouty nephropathy damaging kidneys over time',
      'Independent risk factor for cardiovascular disease and hypertension',
      'Tophi (uric acid lumps) forming under skin if chronically high',
    ],
    lowDisadvantages: [
      'Xanthinuria (rare genetic enzyme deficiency)',
      'Very low uric acid can indicate severe liver disease or Fanconi syndrome (kidney tubule disorder)',
      'May be associated with multiple sclerosis risk in some studies',
    ],
    suddenIncreaseReasons: [
      'Purine-rich diet: red meat, organ meats, shellfish, beer',
      'Dehydration concentrating uric acid in blood',
      'Starting diuretics (especially thiazides)',
      'Rapid weight loss or crash dieting (cell breakdown releases purines)',
      'Alcohol — especially beer and spirits',
      'Tumour lysis syndrome (chemotherapy causing rapid cell death)',
    ],
    suddenDecreaseReasons: [
      'Starting allopurinol or febuxostat (xanthine oxidase inhibitors)',
      'Low-purine diet',
      'Improved hydration',
      'Vitamin C supplementation (mild uricosuric effect)',
      'SGLT2 inhibitors (empagliflozin, dapagliflozin) lower uric acid as side benefit',
    ],
  },

  'ESR': {
    highDisadvantages: [
      'ESR is a non-specific marker — high ESR means something is causing inflammation',
      'May indicate infection, autoimmune disease (lupus, rheumatoid arthritis), or cancer',
      'Temporal arteritis and polymyalgia rheumatica — ESR can be very high',
      'Anaemia falsely elevates ESR',
      'Persistent high ESR warrants investigation for occult infection or malignancy',
    ],
    lowDisadvantages: [
      'Very low ESR is rarely clinically significant',
      'May be seen in polycythaemia vera',
      'Sickle cell disease and spherocytosis can lower ESR artificially',
    ],
    suddenIncreaseReasons: [
      'Acute infection (bacterial or fungal more than viral)',
      'New autoimmune disease flare (rheumatoid arthritis, lupus)',
      'Malignancy (particularly multiple myeloma causes dramatically high ESR)',
      'Pregnancy (physiologically elevated ESR)',
      'Severe anaemia raising ESR',
    ],
    suddenDecreaseReasons: [
      'Effective antibiotic treatment resolving infection',
      'Corticosteroid treatment suppressing inflammation',
      'Immunosuppressant therapy for autoimmune disease working',
    ],
  },
}

/**
 * SUDDEN SHIFT THRESHOLD: A change of > 15% from previous value is considered sudden.
 * Returns { hasSuddenShift, direction } for a given biomarker row.
 */
export function detectSuddenShift(presentVal, previousVal, threshold = 0.15) {
  if (presentVal == null || previousVal == null || isNaN(Number(presentVal)) || isNaN(Number(previousVal))) {
    return { hasSuddenShift: false, direction: null }
  }
  const pv = Number(presentVal)
  const prev = Number(previousVal)
  if (prev === 0) return { hasSuddenShift: false, direction: null }
  const changeFraction = (pv - prev) / Math.abs(prev)
  if (changeFraction > threshold) return { hasSuddenShift: true, direction: 'increase' }
  if (changeFraction < -threshold) return { hasSuddenShift: true, direction: 'decrease' }
  return { hasSuddenShift: false, direction: null }
}

/**
 * Returns disadvantages for a biomarker given its status ('danger' with isHigh or isLow).
 */
export function getBiomarkerInsights(biomarkerName, status, isHigh, isLow, direction, hasSuddenShift) {
  const knowledge = BIOMARKER_CLINICAL_KNOWLEDGE[biomarkerName]
  if (!knowledge) return null

  const disadvantages = isHigh
    ? knowledge.highDisadvantages || []
    : isLow
    ? knowledge.lowDisadvantages || []
    : []

  const shiftReasons =
    hasSuddenShift && direction === 'increase'
      ? knowledge.suddenIncreaseReasons || []
      : hasSuddenShift && direction === 'decrease'
      ? knowledge.suddenDecreaseReasons || []
      : []

  return { disadvantages, shiftReasons }
}
