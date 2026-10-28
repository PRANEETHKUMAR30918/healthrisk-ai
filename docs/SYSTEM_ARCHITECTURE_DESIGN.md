# Chapter 5: System Architecture & Design

## An Intelligent Model for Patient Health Risk Assessment Using Laboratory Report Analysis and Biological Consistency Modeling

---

## 5.1 Architectural Overview & Design Philosophy

HealthRisk AI is structured as a modular, decoupled, multi-tier system engineered around the principles of **Clean Architecture**, **Separation of Concerns**, and **Defensive Clinical Design**. The architecture isolates fragile input processing (OCR/NLP extraction) from rigorous mathematical and physiological modeling (the Three Analytical Engines), and cleanly separates application services from presentation logic and persistence layers.

### 5.1.1 Core Design Principles
1. **Biological Defensibility**: No analytical risk computation is performed without prior physiological consistency validation and confidence evaluation.
2. **Deterministic & Explainable Analytics**: In contrast to black-box neural networks, all calculations (Z-score deviation, biological constraint satisfaction, and multi-analyte risk scoring) follow transparent, auditable mathematical formulations.
3. **Decoupled Knowledge Representation**: Clinical biomarker rules, normalizer alias dictionaries, and organ-system weights are stored in external declarative configuration files (`YAML`), enabling clinical experts to update reference constraints without modifying application code.
4. **Clinical Safety by Design**: The architecture enforces non-diagnostic terminology across all payloads and interface views, preventing unauthorized or unsafe diagnostic claims.
5. **Universal Theme Accessibility**: The presentation layer implements a dual-theme design system defaulting to a clinical white/light theme with seamless dark mode support.

---

## 5.2 System Architecture Diagram

```
                                  [ CLINICIAN / USER ]
                                           │
                                           │ HTTPS / REST
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION TIER (React 18 + Vite)                          │
│                                                                                          │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐   │
│   │  Auth & Session  │  │  Cohort Manager  │  │  Ingestion Flow  │  │ Dynamic Theme │   │
│   │   (authStore)    │  │  (PatientsPage)  │  │  (Upload / OCR)  │  │(Light/Dark/DOM)│   │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘  └────────────────┘   │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐   │
│   │ Extraction Review│  │ Baseline Engine  │  │Consistency Engine│  │  Risk Summary  │   │
│   │ (Inline Verify)  │  │ (Engine 1 View)  │  │ (Engine 2 View)  │  │ (Engine 3 View)│   │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘  └────────────────┘   │
└──────────────────────────────────────────┬───────────────────────────────────────────────┘
                                           │ JSON API / JWT
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION & API TIER (FastAPI)                              │
│                                                                                          │
│   ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│   │                       FastAPI Router & Security Middleware                       │   │
│   │       /api/auth  ·  /api/patients  ·  /api/reports  ·  /api/dashboard            │   │
│   └──────────────────────────────────────────┬───────────────────────────────────────┘   │
│                                              │                                           │
│                 ┌────────────────────────────┴─────────────────────────────┐             │
│                 ▼                                                          ▼             │
│   ┌───────────────────────────┐                              ┌──────────────────────────┐│
│   │    EXTRACTION SUBSYSTEM   │                              │   THREE ANALYTICAL       ││
│   │                           │                              │   ENGINES                ││
│   │  ┌─────────────────────┐  │                              │                          ││
│   │  │ pdfplumber / PyPDF2 │  │                              │  ┌─────────────────────┐ ││
│   │  └──────────┬──────────┘  │                              │  │ ENGINE 1: Baseline  │ ││
│   │             ▼             │                              │  │ (Z-Score Deviation) │ ││
│   │  ┌─────────────────────┐  │                              │  └─────────────────────┘ ││
│   │  │ OCR Provider        │  │                              │  ┌─────────────────────┐ ││
│   │  │ (Tesseract/EasyOCR) │  │                              │  │ ENGINE 2: Consist.  │ ││
│   │  └──────────┬──────────┘  │                              │  │ (Bio-Constraints)   │ ││
│   │             ▼             │                              │  └─────────────────────┘ ││
│   │  ┌─────────────────────┐  │                              │  ┌─────────────────────┐ ││
│   │  │ Clinical NLP Parser │  │                              │  │ ENGINE 3: Risk Mod. │ ││
│   │  │ (Regex + Unit Map)  │  │                              │  │ (Multi-Test HRI)    │ ││
│   │  └──────────┬──────────┘  │                              │  └─────────────────────┘ ││
│   │             ▼             │                              └─────────────┬────────────┘│
│   │  ┌─────────────────────┐  │                                            │             │
│   │  │ Biomarker Normalizer│  │                                            │             │
│   │  │ (Catalog & Plaus.)  │──┼── Extracted Biomarkers ────────────────────┘             │
│   │  └─────────────────────┘  │                                                          │
│   └───────────────────────────┘                                                          │
└──────────────────────────────────────────┬───────────────────────────────────────────────┘
                                           │ Async ORM (SQLAlchemy 2.0)
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                            PERSISTENCE TIER (Database Layer)                             │
│                                                                                          │
│   ┌───────────────┐      ┌───────────────┐      ┌─────────────────┐      ┌───────────┐   │
│   │   patients    │◄────┤  lab_reports  │◄────┤extracted_biomark│◄────┤audit_logs │   │
│   └───────────────┘      └───────────────┘      └─────────────────┘      └───────────┘   │
│                                  │                                                       │
│          ┌───────────────────────┼───────────────────────┐                               │
│          ▼                       ▼                       ▼                               │
│   ┌───────────────┐      ┌───────────────┐      ┌─────────────────┐                      │
│   │baseline_deviat│      │consistency_res│      │ risk_assessments│                      │
│   └───────────────┘      └───────────────┘      └─────────────────┘                      │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.3 Document Ingestion & Extraction Pipeline Architecture

The ingestion pipeline transforms unstructured PDF/image lab reports into validated, structured clinical records:

```
[Raw Lab Report] ──► [Stream Type Check]
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
    [Digital Text Stream]           [Rasterized Image / Fax]
            │                               │
            ▼                               ▼
     (pdfplumber Parser)             (Tesseract OCR Engine)
            │                               │ (Fallback)
            │                               ▼
            │                        (EasyOCR Engine)
            │                               │
            └───────────────┬───────────────┘
                            ▼
               [Clinical Line Tokenizer]
                            │
                            ├─► Matches Biomarker Identifier
                            ├─► Extracts Scalar Numeric Value
                            ├─► Extracts Unit of Measure (UNIT_REGEX)
                            └─► Extracts Reference Bounds (RANGE_REGEX)
                            │
                            ▼
              [Biomarker Normalizer & Catalog]
                            │
                            ├─► Maps Raw Synonyms to Canonical Identifier
                            ├─► Checks Biological Plausibility Bounds
                            └─► Computes Extraction Confidence Score
                            │
                            ▼
             [Clinician Verification Table]
```

### 5.3.1 Extraction Strategy & Noise Suppression
- **Commentary Filtering**: Diagnostic narratives and disclaimer lines (e.g., `* Fasting glucose indicates...`) are filtered out prior to value parsing using regex-based note detectors (`_is_note_line`) to avoid false-positive number assignments.
- **Reference Span Stripping**: Reference ranges (e.g., `70 - 100`, `< 5.7`, `> 60`) and parenthetical notations (e.g., `(25-OH)`, `(K+)`, `(CKD-EPI)`) are isolated and stripped from the active text buffer before the scalar patient finding is extracted.
- **Biomarker Normalizer (`BiomarkerNormalizer`)**: Standardizes over 45 routine lab analytes across Hematology, Hepatic, Renal, Lipid, Glycemic, Thyroid, and Mineral panels.

---

## 5.4 Detailed Engine Specifications

### 5.4.1 Engine 1: Personalized Baseline Deviation Engine
Engine 1 evaluates patient results against their own historical physiological mean rather than static population intervals.

#### Mathematical Model
Given historical observations $X_1, X_2, \dots, X_n$ for a specific biomarker:
1. **Sample Mean**:
   $$\mu = \frac{1}{n} \sum_{i=1}^n X_i$$
2. **Sample Standard Deviation**:
   $$\sigma = \sqrt{\frac{1}{n} \sum_{i=1}^n (X_i - \mu)^2}$$
3. **Longitudinal Z-Score**:
   $$Z = \frac{X_{\text{current}} - \mu}{\sigma}$$

#### Operational Safeguards
- **Cold-Start Policy**: If historical sample count $n < 3$, the engine outputs `INSUFFICIENT_HISTORY` and evaluates current readings against population bounds with an explicit clinical label.
- **Zero-Variance Invariant Handling**: If $\sigma = 0$ (a patient whose historical readings were entirely invariant), the engine sets $Z = 0$ if $X_{\text{current}} = \mu$, or flags a critical step-change deviation without encountering a divide-by-zero runtime error.
- **Severity Stratification**:
  - $|Z| < 1.0$: `WITHIN_BASELINE`
  - $1.0 \le |Z| < 2.0$: `MINOR_DEVIATION`
  - $2.0 \le |Z| < 3.0$: `MODERATE_DEVIATION`
  - $|Z| \ge 3.0$: `SIGNIFICANT_DEVIATION`

---

### 5.4.2 Engine 2: Biological Consistency & Reliability Verification Engine
Engine 2 cross-examines physiologically coupled biomarker pairs to detect sample degradation, transcription errors, or analytical discrepancies.

#### Physiological Rule Matrix
Defined in `consistency_rules.yaml`:
1. **`hb_rbc_check` (Mean Corpuscular Hemoglobin)**:
   $$\text{MCH} = \frac{\text{Hb (g/dL)} \times 10}{\text{RBC (10}^6\text{/uL)}} \quad \Rightarrow \quad 24.0 \le \text{MCH} \le 36.0\text{ pg}$$
2. **`hb_hct_check` (Rule of Three)**:
   $$\text{Hct (\%)} \approx 3 \times \text{Hb (g/dL)} \pm 3.0$$
3. **`glucose_hba1c_check` (Glycemic Alignment)**:
   $$\text{eAG (mg/dL)} = 28.7 \times \text{HbA1c (\%)} - 46.7$$
   Verifies concordance between acute fasting blood glucose and 90-day glycated hemoglobin.
4. **`tc_ldl_check` (Lipid Fraction Constraint)**:
   $$\text{Total Cholesterol} > \text{LDL Cholesterol} + 20\text{ mg/dL}$$

#### Scoring Formulation
- **Consistency Score**:
  $$\text{Consistency Score} = 1.0 - \frac{\sum_{k \in \text{Violations}} W_k}{\sum_{k \in \text{Evaluated}} W_k}$$
- **Aggregate Reliability Index**:
  $$\text{Reliability} = 0.40 \cdot \text{Consistency} + 0.40 \cdot \text{Extraction Confidence} + 0.20 \cdot \text{Baseline Stability}$$

---

### 5.4.3 Engine 3: Prioritized Multi-Test Disease Risk Analysis Engine
Engine 3 synthesizes multi-analyte abnormalities into an overall **Health Risk Index (HRI)** and categorical organ-system risk indicators.

#### Disease Categorization & Weighting
Biomarkers are grouped into 6 clinical categories:
- **Cardiovascular**: Total Cholesterol, LDL, HDL, Triglycerides, VLDL.
- **Metabolic**: Fasting Glucose, Postprandial Glucose, HbA1c, Fasting Insulin, HOMA-IR.
- **Renal**: Serum Creatinine, BUN, eGFR, Uric Acid, Electrolytes (Na, K, Ca, P).
- **Hepatic**: ALT (SGPT), AST (SGOT), Bilirubin (Total/Direct), ALP, GGT, Albumin.
- **Haematological**: Hemoglobin, RBC, WBC, Platelets, Hematocrit, ESR.
- **Thyroid**: TSH, Free T3, Free T4, Anti-TPO.

#### Mathematical Formulation
1. **Feature Score ($f_i$)**:
   $$f_i = \begin{cases} 1.0 & \text{if analyte is abnormal outside population bounds} \\ 0.5 & \text{if analyte is within population bounds but } |Z| \ge 2.0 \\ 0.0 & \text{otherwise} \end{cases}$$
2. **Disease Category Score ($S_c$)**:
   $$S_c = \sum_{i \in \text{Category}_c} (f_i \times w_i)$$
3. **Normalized Category Risk ($R_c$)**:
   $$R_c = \frac{S_c}{\sum_{i \in \text{Category}_c} w_i}$$
4. **Overall Health Risk Index (HRI)**:
   $$\text{HRI} = \frac{\sum_{c} (R_c \times V_c)}{\sum_{c} V_c}$$
   where $V_c$ is the clinical severity weight of disease category $c$.

#### Stratified Risk Tiers
- `0.00 – 0.20`: 🟢 **LOW RISK**
- `0.20 – 0.40`: 🟡 **MILD RISK**
- `0.40 – 0.65`: 🟠 **MODERATE RISK**
- `0.65 – 1.00`: 🔴 **ELEVATED RISK**

---

## 5.5 Database Architecture & Schema Design

HealthRisk AI uses an asynchronous SQLAlchemy 2.0 ORM architecture (supporting SQLite in local development and PostgreSQL in enterprise deployments):

### 5.5.1 Entity-Relationship (ER) Model
```
┌──────────────────┐
│     patients     │
├──────────────────┤
│ id (UUID, PK)    │
│ patient_code     │◄─────────────────┐
│ date_of_birth    │                  │
│ sex              │                  │
└─────────┬────────┘                  │
          │ 1:N                       │
          ▼                           │
┌──────────────────┐                  │
│   lab_reports    │                  │
├──────────────────┤                  │
│ id (UUID, PK)    │                  │
│ patient_id (FK)  │                  │
│ report_date      │                  │
│ lab_name         │                  │
│ processing_status│                  │
└─────────┬────────┘                  │
          │ 1:N                       │
          ├───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│extracted_biomark │        │baseline_deviat.  │        │consistency_res.  │
├──────────────────┤        ├──────────────────┤        ├──────────────────┤
│ id (UUID, PK)    │        │ id (UUID, PK)    │        │ id (UUID, PK)    │
│ report_id (FK)   │        │ report_id (FK)   │        │ report_id (FK)   │
│ biomarker_name   │        │ biomarker_name   │        │ consistency_score│
│ numeric_value    │        │ z_score          │        │ reliability_score│
│ unit             │        │ deviation_status │        │ rule_results_json│
│ confidence_score │        └──────────────────┘        └──────────────────┘
│ abnormal_flag    │
└──────────────────┘                  │
                                      ▼
                            ┌──────────────────┐
                            │ risk_assessments │
                            ├──────────────────┤
                            │ id (UUID, PK)    │
                            │ report_id (FK)   │
                            │ overall_hri      │
                            │ risk_tier        │
                            │ category_scores  │
                            └──────────────────┘
```

---

## 5.6 API Architecture & Endpoint Specifications

Built on FastAPI with automated OpenAPI/Swagger documentation at `/docs`:

| Method | Endpoint | Description | Security |
|---|---|---|---|
| `POST` | `/api/auth/login` | OAuth2 password flow; issues JWT | Public |
| `POST` | `/api/auth/register` | Registers clinician account | Admin |
| `GET` | `/api/patients` | Retrieves all cohort records | Clinician / Admin |
| `GET` | `/api/patients/{id}` | Retrieves single patient profile | Clinician / Admin |
| `POST` | `/api/reports/upload` | Multipart file upload and report record creation | Clinician / Admin |
| `POST` | `/api/reports/{id}/extract` | Executes document extraction pipeline | Clinician / Admin |
| `GET` | `/api/reports/{id}/extraction`| Returns extracted findings and confidence | Clinician / Admin |
| `PUT` | `/api/reports/{id}/extraction/{bid}` | Clinician inline correction of biomarker | Clinician / Admin |
| `POST` | `/api/reports/{id}/analyze` | Triggers execution of the Three Engines | Clinician / Admin |
| `GET` | `/api/reports/{id}/baseline` | Returns Engine 1 Z-score baseline results | Clinician / Admin |
| `GET` | `/api/reports/{id}/consistency`| Returns Engine 2 physiological consistency results| Clinician / Admin |
| `GET` | `/api/reports/{id}/risk` | Returns Engine 3 multi-test HRI risk scores | Clinician / Admin |
| `GET` | `/api/reports/{id}/summary` | Returns synthesized clinical summary & recommendations | Clinician / Admin |
| `GET` | `/api/dashboard` | Returns cohort-wide metrics and surveillance statistics | Clinician / Admin |
| `GET` | `/health` | System health and academic safety notice | Public |

---

## 5.7 User Interface & Theme System Design

The presentation tier is implemented as a single-page React 18 application bundled with Vite:
- **State & Data Invalidation**: `Zustand` manages global session and theme states; `@tanstack/react-query` handles caching, retry, and background data synchronization.
- **Theme Architecture (`themeStore.js`)**:
  - The application strictly defaults to the **White (Light) Theme**.
  - Tailwind CSS `class` strategy dynamically toggles `.dark` on `document.documentElement`.
  - Persists preference in `localStorage` (`healthrisk_theme`).
  - Interactive Sun/Moon theme toggle accessible from both the application navigation bar and the login screen.
- **Data Visualization**: Recharts provides responsive, accessible SVG rendering of longitudinal biomarker trends (`BiomarkerTrendChart`) and multi-panel risk gauges.

---

## 5.8 Clinical Decision Support (CDS) Safety Guardrails

In compliance with international standards for clinical decision support software:
1. **Non-Diagnostic Lexicon**: The system never outputs terms such as "diagnosed", "prescribed", or "definitive disease". Outputs are labeled **"potential risk indicator"**, **"abnormal pattern"**, or **"requires clinical review"**.
2. **Prominent Disclaimers**: Every API summary payload and user interface view embeds a non-dismissible clinical disclaimer reminding users that the tool is an academic decision-support prototype.
3. **Traceable Corrections**: If a clinician adjusts an extracted value in the review table, the original raw value, corrected value, and user ID are retained in the database for complete medical auditability.
