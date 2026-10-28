# REST API Documentation

Base URL: `http://localhost:8000/api`

### Authentication
- `POST /auth/register` — Register a new researcher or clinician account.
- `POST /auth/login` — Authenticate and receive a JWT bearer token.

### Patient Cohort
- `GET /patients` — List all patients in the clinician's workspace.
- `POST /patients` — Create a new patient record (`patient_code`, `date_of_birth`, `sex`).
- `GET /patients/{id}` — Get single patient metadata and panel count.
- `GET /patients/{id}/biomarkers/{name}/trend` — Get longitudinal values for a specific biomarker.

### Reports & Ingestion
- `POST /reports/upload` — Upload multipart document (`file`, `patient_id`, `report_date`, `lab_name`).
- `GET /reports` — List recent reports or filter by `patient_id`.
- `GET /reports/{id}` — Get report details and processing status.

### Extraction & Verification
- `POST /reports/{id}/extract` — Run OCR and NLP extraction on report document.
- `GET /reports/{id}/extraction` — Retrieve extracted biomarkers with confidence ratings.
- `PUT /reports/{id}/extraction/{biomarker_id}` — Apply clinician correction to extracted value or unit.

### Analytical Engines
- `POST /reports/{id}/analyze` — Run all Three Analytical Engines and generate health summary.
- `GET /reports/{id}/baseline` — Retrieve Engine 1 personalized baseline deviation results.
- `GET /reports/{id}/consistency` — Retrieve Engine 2 biological consistency and reliability results.
- `GET /reports/{id}/risk` — Retrieve Engine 3 multi-test disease risk results.
- `GET /reports/{id}/summary` — Retrieve patient-friendly synthesized health summary.

### Dashboard
- `GET /dashboard` — Aggregated cohort statistics, recent reports, and active risk alerts.
