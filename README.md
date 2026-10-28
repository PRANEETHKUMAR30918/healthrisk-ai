# 🏥 HealthRisk AI — Clinical Intelligence Platform

> An AI-powered lab report analysis system that extracts biomarkers from uploaded PDFs, performs multi-engine health risk scoring, and generates comprehensive patient health summaries.

---

## 📸 Features

- 🔬 **Multi-Engine OCR** — Extracts biomarker values from PDF lab reports automatically
- 🧠 **20+ Disease Risk Detection** — Detects risks for Diabetes, Heart Disease, Liver Disease, Thyroid, Gout, Pancreatitis, Sepsis, Cancer markers, and more
- 📊 **Personalized Baseline Engine** — Tracks deviations from your personal historical averages
- ⚠️ **Physiological Consistency Engine** — Cross-checks lab values for plausibility
- 📈 **Trend Analysis** — Detects sudden shifts (≥15% variance) between reports
- 👥 **Multi-patient Dashboard** — Manage multiple patient profiles
- 🔐 **Secure Auth** — JWT-based login with bcrypt password hashing

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Database | SQLite (auto-created on first run) |
| OCR | Tesseract + EasyOCR + pdfplumber |
| Auth | JWT Tokens + bcrypt |

---

## 🚀 Quick Start (For Friends — No Experience Needed!)

### ✅ Prerequisites — Install These First

You only need to install **2 things** before running the app:

#### 1. Python 3.11+
1. Go to 👉 **https://www.python.org/downloads/**
2. Click **"Download Python"** (the big yellow button)
3. Run the installer
4. ⚠️ **IMPORTANT**: Check ✅ **"Add Python to PATH"** during installation
5. Click Install Now

#### 2. Node.js (LTS version)
1. Go to 👉 **https://nodejs.org/**
2. Click **"Download LTS"** (the recommended version)
3. Run the installer with all **default settings** (just keep clicking Next)

---

### ▶️ Running the App

After installing Python and Node.js:

1. **Download or clone this project:**
   ```
   Click the green "Code" button on GitHub → "Download ZIP" → Extract the folder
   ```
   OR if you have Git:
   ```bash
   git clone https://github.com/YOUR_USERNAME/healthrisk-ai.git
   cd healthrisk-ai
   ```

2. **Double-click `setup.bat`** inside the project folder

   > The script will automatically:
   > - ✅ Install all Python packages
   > - ✅ Install all frontend packages
   > - ✅ Create the database
   > - ✅ Start the backend server
   > - ✅ Start the frontend server
   > - ✅ Open the app in your browser

3. **The app will open automatically at:** `http://localhost:5173`

---

### 🔄 Starting the App Again (Next Time)

After the first setup, just double-click **`start.bat`** to launch the app instantly.

---

### 🛑 Stopping the App

Close the two black terminal windows labeled:
- `HealthRisk AI — Backend Server`
- `HealthRisk AI — Frontend Server`

---

## 📁 Project Structure

```
healthrisk-ai/
│
├── setup.bat              ← 🟢 Double-click this to install & run (first time)
├── start.bat              ← 🟢 Double-click this to run (after first setup)
│
├── backend/               ← Python FastAPI server
│   ├── app/
│   │   ├── api/           ← REST API endpoints
│   │   ├── engines/       ← Risk, Baseline, Consistency engines
│   │   ├── extraction/    ← PDF/OCR processing pipeline
│   │   ├── models/        ← Database models
│   │   ├── rules/         ← Disease rules (YAML config files)
│   │   │   ├── biomarkers.yaml         ← Reference ranges
│   │   │   ├── risk_rules.yaml         ← 24 disease risk categories
│   │   │   └── normalization_map.yaml  ← Biomarker alias mappings
│   │   └── services/      ← Business logic
│   └── requirements.txt   ← Python dependencies
│
├── frontend/              ← React web app
│   ├── src/
│   │   ├── pages/         ← Dashboard, Upload, Summary, Risk pages
│   │   ├── components/    ← Reusable UI components
│   │   └── services/      ← API calls
│   └── package.json       ← Node dependencies
│
└── .env.example           ← Environment config template
```

---

## 🔐 Default Login

When you first open the app, register a new account on the Login page.

> If the backend shows an error on first run, wait 5 seconds and refresh the page. The database is being initialized.

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| `'python' is not recognized` | Re-install Python and check **"Add to PATH"** ✅ |
| `'node' is not recognized` | Re-install Node.js with default settings |
| App doesn't open in browser | Manually go to `http://localhost:5173` |
| Backend error on first run | Wait 5 seconds and refresh the page |
| Port already in use | Close other terminal windows and try again |

---

## 👥 For Developers

```bash
# Backend (from /backend folder)
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (from /frontend folder)
npm install
npm run dev
```

API docs available at: **http://127.0.0.1:8000/docs**

---

## ⚠️ Disclaimer

This tool is for **educational and research purposes only**. It is **not a medical device** and should not replace professional medical diagnosis or treatment. Always consult a qualified healthcare professional for medical advice.

---

*Built with ❤️ using FastAPI + React*
