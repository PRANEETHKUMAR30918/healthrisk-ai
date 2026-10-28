# Project Limitations & Academic Boundaries

1. **Biomarker Coverage Scope**: The prototype supports 18 key biomarkers across Complete Blood Count, Metabolic, Lipid, and Renal panels. Less common specialized tests (toxicology, autoimmune markers, genomic panels) are outside current coverage.
2. **Dependence on OCR Quality**: Scanned reports with heavy skew, low resolution (<150 DPI), or physical artifacts may produce lower confidence scores, requiring manual verification in the review table.
3. **Longitudinal History Requirement**: The Personalized Baseline Engine requires a minimum of 3 historical data points ($n \ge 3$) to generate a personal Z-score. When insufficient history exists, the system transparently falls back to population reference ranges.
4. **Research Decision-Support Designation**: Calculated risk scores and biological consistency cross-checks are clinical decision-support indicators and research models. They do not constitute medically validated diagnostic certainty and have not undergone FDA/CE-MDR regulatory clearance.
5. **Synthetic Evaluation Cohort**: Datasets used for demonstration and testing are synthetic and created to model distinct clinical patterns; they do not establish formal clinical trial efficacy.
