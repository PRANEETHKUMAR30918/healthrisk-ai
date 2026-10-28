# Development Guide

## Local Workspace Setup
1. Clone repository and install dependencies in virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r backend/requirements.txt
   pip install -r backend/requirements-dev.txt
   ```
2. Set up local `.env`:
   ```bash
   cp .env.example backend/.env
   ```
3. Initialize Database:
   ```bash
   cd backend
   alembic upgrade head
   python ../data/synthetic/seed_patients.py
   ```
4. Run Development Servers:
   - Backend: `uvicorn app.main:app --reload`
   - Frontend: `cd frontend && npm install && npm run dev`

## Adding a New Clinical Rule
1. Open `backend/app/rules/consistency_rules.yaml`.
2. Add a new rule entry defining `id`, `biomarker_a`, `biomarker_b`, `relationship`, `tolerance_pct`, `weight`, and `explanation_template`.
3. If introducing a custom mathematical relationship check, add the logic handler to `backend/app/engines/consistency/engine.py` in `_check_physiological_relation()`.
4. Run unit tests to verify:
   ```bash
   pytest backend/tests/unit/test_consistency_engine.py
   ```
