"""Synthetic cohort database seeder for demonstration and evaluation.

Creates 10 clinical scenario patients with longitudinal laboratory records.
All medical profiles are purely synthetic.
"""
import asyncio
import sys
import os
import uuid
from datetime import date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))

from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.models.patient import Patient
from app.models.report import LaboratoryReport
from app.models.extraction_result import ExtractionResult
from app.core.security import hash_password
from sqlalchemy import select

SYNTHETIC_DATASET = [
    {
        "code": "SYN-PAT-001",
        "dob": date(1986, 5, 14),
        "sex": "M",
        "description": "Baseline Normal Patient - Longitudinal Stability",
        "reports": [
            {
                "date": date(2023, 3, 10),
                "lab": "Metropolitan Health Diagnostics",
                "data": {"Hemoglobin": (15.2, "g/dL"), "RBC": (5.1, "10^6/uL"), "WBC": (6.2, "10^3/uL"), "Platelets": (245.0, "10^3/uL"), "MCV": (89.0, "fL"), "Hematocrit": (45.0, "%"), "Fasting Blood Glucose": (88.0, "mg/dL"), "HbA1c": (5.2, "%"), "Total Cholesterol": (175.0, "mg/dL"), "HDL": (55.0, "mg/dL"), "LDL": (98.0, "mg/dL"), "Triglycerides": (110.0, "mg/dL"), "Serum Creatinine": (0.92, "mg/dL"), "BUN": (13.0, "mg/dL"), "eGFR": (102.0, "mL/min/1.73m2")}
            },
            {
                "date": date(2023, 9, 15),
                "lab": "Metropolitan Health Diagnostics",
                "data": {"Hemoglobin": (15.0, "g/dL"), "RBC": (5.0, "10^6/uL"), "WBC": (6.4, "10^3/uL"), "Platelets": (240.0, "10^3/uL"), "MCV": (88.5, "fL"), "Hematocrit": (44.8, "%"), "Fasting Blood Glucose": (91.0, "mg/dL"), "HbA1c": (5.3, "%"), "Total Cholesterol": (180.0, "mg/dL"), "HDL": (54.0, "mg/dL"), "LDL": (102.0, "mg/dL"), "Triglycerides": (118.0, "mg/dL"), "Serum Creatinine": (0.94, "mg/dL"), "BUN": (14.0, "mg/dL"), "eGFR": (100.0, "mL/min/1.73m2")}
            },
            {
                "date": date(2024, 3, 20),
                "lab": "Metropolitan Health Diagnostics",
                "data": {"Hemoglobin": (15.1, "g/dL"), "RBC": (5.1, "10^6/uL"), "WBC": (6.1, "10^3/uL"), "Platelets": (250.0, "10^3/uL"), "MCV": (89.0, "fL"), "Hematocrit": (45.2, "%"), "Fasting Blood Glucose": (89.0, "mg/dL"), "HbA1c": (5.2, "%"), "Total Cholesterol": (178.0, "mg/dL"), "HDL": (56.0, "mg/dL"), "LDL": (99.0, "mg/dL"), "Triglycerides": (115.0, "mg/dL"), "Serum Creatinine": (0.91, "mg/dL"), "BUN": (13.5, "mg/dL"), "eGFR": (103.0, "mL/min/1.73m2")}
            }
        ]
    },
    {
        "code": "SYN-PAT-002",
        "dob": date(1974, 11, 28),
        "sex": "F",
        "description": "Personal Baseline Deviation - Declining Hemoglobin",
        "reports": [
            {
                "date": date(2022, 6, 1),
                "lab": "City Central Lab",
                "data": {"Hemoglobin": (13.8, "g/dL"), "RBC": (4.5, "10^6/uL"), "MCV": (88.0, "fL"), "Hematocrit": (41.4, "%"), "Ferritin": (45.0, "ng/mL")}
            },
            {
                "date": date(2022, 12, 15),
                "lab": "City Central Lab",
                "data": {"Hemoglobin": (13.4, "g/dL"), "RBC": (4.3, "10^6/uL"), "MCV": (87.0, "fL"), "Hematocrit": (40.0, "%"), "Ferritin": (32.0, "ng/mL")}
            },
            {
                "date": date(2023, 7, 10),
                "lab": "City Central Lab",
                "data": {"Hemoglobin": (12.8, "g/dL"), "RBC": (4.1, "10^6/uL"), "MCV": (84.0, "fL"), "Hematocrit": (38.0, "%"), "Ferritin": (20.0, "ng/mL")}
            },
            {
                "date": date(2024, 2, 5),
                "lab": "City Central Lab",
                "data": {"Hemoglobin": (11.6, "g/dL"), "RBC": (3.8, "10^6/uL"), "MCV": (79.0, "fL"), "Hematocrit": (34.5, "%"), "Ferritin": (10.0, "ng/mL")}
            }
        ]
    },
    {
        "code": "SYN-PAT-003",
        "dob": date(1963, 8, 22),
        "sex": "M",
        "description": "Progressive Metabolic / Glycemic Risk Pattern",
        "reports": [
            {
                "date": date(2022, 4, 10),
                "lab": "Endocrine Health Lab",
                "data": {"Fasting Blood Glucose": (108.0, "mg/dL"), "HbA1c": (5.9, "%"), "Postprandial Blood Glucose": (148.0, "mg/dL"), "Total Cholesterol": (210.0, "mg/dL"), "Triglycerides": (185.0, "mg/dL")}
            },
            {
                "date": date(2023, 2, 18),
                "lab": "Endocrine Health Lab",
                "data": {"Fasting Blood Glucose": (124.0, "mg/dL"), "HbA1c": (6.7, "%"), "Postprandial Blood Glucose": (172.0, "mg/dL"), "Total Cholesterol": (225.0, "mg/dL"), "Triglycerides": (210.0, "mg/dL")}
            },
            {
                "date": date(2023, 11, 4),
                "lab": "Endocrine Health Lab",
                "data": {"Fasting Blood Glucose": (142.0, "mg/dL"), "HbA1c": (7.4, "%"), "Postprandial Blood Glucose": (195.0, "mg/dL"), "Total Cholesterol": (235.0, "mg/dL"), "Triglycerides": (230.0, "mg/dL")}
            },
            {
                "date": date(2024, 5, 12),
                "lab": "Endocrine Health Lab",
                "data": {"Fasting Blood Glucose": (168.0, "mg/dL"), "HbA1c": (8.6, "%"), "Postprandial Blood Glucose": (240.0, "mg/dL"), "Total Cholesterol": (248.0, "mg/dL"), "Triglycerides": (270.0, "mg/dL")}
            }
        ]
    },
    {
        "code": "SYN-PAT-004",
        "dob": date(1992, 2, 14),
        "sex": "F",
        "description": "Physiological Inconsistency Scenario (Hb vs RBC Discordance)",
        "reports": [
            {
                "date": date(2023, 5, 20),
                "lab": "Metro Pathology",
                "data": {"Hemoglobin": (13.0, "g/dL"), "RBC": (4.4, "10^6/uL"), "MCV": (88.0, "fL"), "Hematocrit": (39.0, "%")}
            },
            {
                "date": date(2023, 11, 22),
                "lab": "Metro Pathology",
                "data": {"Hemoglobin": (13.2, "g/dL"), "RBC": (4.5, "10^6/uL"), "MCV": (87.5, "fL"), "Hematocrit": (39.5, "%")}
            },
            {
                "date": date(2024, 4, 18),
                "lab": "Scanned Lab Service",
                "data": {"Hemoglobin": (8.2, "g/dL"), "RBC": (5.6, "10^6/uL"), "MCV": (88.0, "fL"), "Hematocrit": (42.0, "%")}
            }
        ]
    },
    {
        "code": "SYN-PAT-005",
        "dob": date(1980, 9, 30),
        "sex": "M",
        "description": "Atherogenic Dyslipidemia Pattern",
        "reports": [
            {
                "date": date(2023, 1, 15),
                "lab": "CardioVascular Diagnostics",
                "data": {"Total Cholesterol": (240.0, "mg/dL"), "LDL": (165.0, "mg/dL"), "HDL": (38.0, "mg/dL"), "Triglycerides": (220.0, "mg/dL")}
            },
            {
                "date": date(2023, 8, 20),
                "lab": "CardioVascular Diagnostics",
                "data": {"Total Cholesterol": (255.0, "mg/dL"), "LDL": (175.0, "mg/dL"), "HDL": (36.0, "mg/dL"), "Triglycerides": (260.0, "mg/dL")}
            },
            {
                "date": date(2024, 3, 12),
                "lab": "CardioVascular Diagnostics",
                "data": {"Total Cholesterol": (270.0, "mg/dL"), "LDL": (188.0, "mg/dL"), "HDL": (34.0, "mg/dL"), "Triglycerides": (310.0, "mg/dL")}
            }
        ]
    },
    {
        "code": "SYN-PAT-006",
        "dob": date(1958, 4, 12),
        "sex": "M",
        "description": "Renal Function Decline Trajectory",
        "reports": [
            {
                "date": date(2022, 5, 10),
                "lab": "Renal Care Clinical Laboratory",
                "data": {"Serum Creatinine": (1.1, "mg/dL"), "BUN": (18.0, "mg/dL"), "eGFR": (74.0, "mL/min/1.73m2"), "Hemoglobin": (13.8, "g/dL")}
            },
            {
                "date": date(2023, 1, 12),
                "lab": "Renal Care Clinical Laboratory",
                "data": {"Serum Creatinine": (1.35, "mg/dL"), "BUN": (24.0, "mg/dL"), "eGFR": (58.0, "mL/min/1.73m2"), "Hemoglobin": (12.9, "g/dL")}
            },
            {
                "date": date(2023, 9, 20),
                "lab": "Renal Care Clinical Laboratory",
                "data": {"Serum Creatinine": (1.65, "mg/dL"), "BUN": (32.0, "mg/dL"), "eGFR": (45.0, "mL/min/1.73m2"), "Hemoglobin": (11.8, "g/dL")}
            },
            {
                "date": date(2024, 4, 1),
                "lab": "Renal Care Clinical Laboratory",
                "data": {"Serum Creatinine": (2.05, "mg/dL"), "BUN": (42.0, "mg/dL"), "eGFR": (34.0, "mL/min/1.73m2"), "Hemoglobin": (10.9, "g/dL")}
            }
        ]
    },
    {
        "code": "SYN-PAT-007",
        "dob": date(2001, 7, 24),
        "sex": "F",
        "description": "Insufficient Historical Data (New Patient Single Report)",
        "reports": [
            {
                "date": date(2024, 5, 2),
                "lab": "Campus Health Services",
                "data": {"Hemoglobin": (12.2, "g/dL"), "RBC": (4.2, "10^6/uL"), "WBC": (6.8, "10^3/uL"), "Platelets": (220.0, "10^3/uL"), "Fasting Blood Glucose": (85.0, "mg/dL")}
            }
        ]
    },
    {
        "code": "SYN-PAT-008",
        "dob": date(1989, 12, 19),
        "sex": "M",
        "description": "Multi-System Complex Pattern (Cardiometabolic & Renal Markers)",
        "reports": [
            {
                "date": date(2023, 2, 11),
                "lab": "Precision Diagnostics",
                "data": {"Fasting Blood Glucose": (115.0, "mg/dL"), "HbA1c": (6.2, "%"), "Total Cholesterol": (215.0, "mg/dL"), "LDL": (140.0, "mg/dL"), "Serum Creatinine": (1.1, "mg/dL"), "eGFR": (78.0, "mL/min/1.73m2")}
            },
            {
                "date": date(2023, 8, 14),
                "lab": "Precision Diagnostics",
                "data": {"Fasting Blood Glucose": (132.0, "mg/dL"), "HbA1c": (6.8, "%"), "Total Cholesterol": (230.0, "mg/dL"), "LDL": (152.0, "mg/dL"), "Serum Creatinine": (1.25, "mg/dL"), "eGFR": (68.0, "mL/min/1.73m2")}
            },
            {
                "date": date(2024, 3, 22),
                "lab": "Precision Diagnostics",
                "data": {"Fasting Blood Glucose": (155.0, "mg/dL"), "HbA1c": (7.9, "%"), "Total Cholesterol": (245.0, "mg/dL"), "LDL": (168.0, "mg/dL"), "Serum Creatinine": (1.45, "mg/dL"), "eGFR": (56.0, "mL/min/1.73m2")}
            }
        ]
    },
    {
        "code": "SYN-PAT-009",
        "dob": date(1977, 3, 5),
        "sex": "F",
        "description": "Microcytic Hypochromic Anemia Recovery",
        "reports": [
            {
                "date": date(2023, 4, 15),
                "lab": "Hematology Specialist Center",
                "data": {"Hemoglobin": (8.8, "g/dL"), "RBC": (3.4, "10^6/uL"), "MCV": (68.0, "fL"), "Hematocrit": (26.0, "%"), "Ferritin": (6.0, "ng/mL")}
            },
            {
                "date": date(2023, 7, 20),
                "lab": "Hematology Specialist Center",
                "data": {"Hemoglobin": (10.4, "g/dL"), "RBC": (3.9, "10^6/uL"), "MCV": (74.0, "fL"), "Hematocrit": (31.0, "%"), "Ferritin": (18.0, "ng/mL")}
            },
            {
                "date": date(2023, 11, 28),
                "lab": "Hematology Specialist Center",
                "data": {"Hemoglobin": (12.1, "g/dL"), "RBC": (4.3, "10^6/uL"), "MCV": (82.0, "fL"), "Hematocrit": (36.5, "%"), "Ferritin": (35.0, "ng/mL")}
            },
            {
                "date": date(2024, 4, 10),
                "lab": "Hematology Specialist Center",
                "data": {"Hemoglobin": (13.2, "g/dL"), "RBC": (4.5, "10^6/uL"), "MCV": (86.0, "fL"), "Hematocrit": (39.8, "%"), "Ferritin": (52.0, "ng/mL")}
            }
        ]
    },
    {
        "code": "SYN-PAT-010",
        "dob": date(1983, 10, 10),
        "sex": "M",
        "description": "Simulated OCR Noise & Low Confidence Extraction",
        "reports": [
            {
                "date": date(2023, 6, 12),
                "lab": "Community Clinic OCR Scanned",
                "data": {"Hemoglobin": (14.2, "g/dL"), "RBC": (4.8, "10^6/uL"), "WBC": (7.1, "10^3/uL"), "Fasting Blood Glucose": (94.0, "mg/dL")}
            },
            {
                "date": date(2023, 12, 18),
                "lab": "Community Clinic OCR Scanned",
                "data": {"Hemoglobin": (14.0, "g/dL"), "RBC": (4.7, "10^6/uL"), "WBC": (7.4, "10^3/uL"), "Fasting Blood Glucose": (96.0, "mg/dL")}
            },
            {
                "date": date(2024, 5, 24),
                "lab": "Community Clinic OCR Scanned",
                "data": {"Hemoglobin": (13.9, "g/dL"), "RBC": (4.6, "10^6/uL"), "WBC": (7.3, "10^3/uL"), "Fasting Blood Glucose": (95.0, "mg/dL")}
            }
        ]
    }
]

async def seed_data():
    print("Beginning synthetic dataset population...")
    from app.database.base import Base
    from app.database.session import engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        q = select(User).where(User.email == "demo@healthrisk.ai")
        existing_user = (await session.execute(q)).scalar_one_or_none()
        if existing_user:
            print("Demo user already exists. Database already populated.")
            return

        # 1. Create Default Practitioner / Demo Account
        demo_user = User(
            email="demo@healthrisk.ai",
            password_hash=hash_password("Demo@12345"),
            full_name="Dr. Alex Rivera (Clinical Researcher)",
            role="clinician"
        )
        session.add(demo_user)
        await session.flush()
        print(f"Created researcher account: {demo_user.email}")

        # 2. Populate patients and historical panels
        for item in SYNTHETIC_DATASET:
            pat = Patient(
                user_id=demo_user.id,
                patient_code=item["code"],
                date_of_birth=item["dob"],
                sex=item["sex"]
            )
            session.add(pat)
            await session.flush()

            for rep_data in item["reports"]:
                rep = LaboratoryReport(
                    patient_id=pat.id,
                    filename=f"{item['code']}_{rep_data['date']}.pdf",
                    original_filename=f"LabReport_{rep_data['date']}.pdf",
                    file_path=f"uploads/{item['code']}_{rep_data['date']}.pdf",
                    file_type="pdf",
                    file_size_bytes=42500,
                    report_date=rep_data["date"],
                    lab_name=rep_data["lab"],
                    processing_status="ANALYZED",
                    extraction_method="PDF_TEXT_PLUMBER"
                )
                session.add(rep)
                await session.flush()

                for bm_name, (val, unit) in rep_data["data"].items():
                    ext = ExtractionResult(
                        report_id=rep.id,
                        biomarker_name_raw=bm_name,
                        biomarker_name_canonical=bm_name,
                        numeric_value=val,
                        unit=unit,
                        confidence_score=0.96,
                        is_corrected=False,
                        source_location="table 1",
                        extraction_status="EXTRACTED"
                    )
                    session.add(ext)

        await session.commit()
        print("Successfully seeded 10 patient trajectories with historical lab panels!")

if __name__ == "__main__":
    asyncio.run(seed_data())
