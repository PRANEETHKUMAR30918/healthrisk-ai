"""Pytest fixtures and configuration."""
import os
import sys
import pytest

# Ensure app package is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.fixture
def sample_biomarker_dict():
    return {
        "Hemoglobin": 14.2,
        "RBC": 4.8,
        "WBC": 6.5,
        "Platelets": 240.0,
        "MCV": 88.0,
        "Hematocrit": 42.6,
        "Fasting Blood Glucose": 92.0,
        "HbA1c": 5.4,
        "Total Cholesterol": 180.0,
        "HDL": 52.0,
        "LDL": 105.0,
        "Triglycerides": 120.0,
        "Serum Creatinine": 0.95,
        "BUN": 14.0,
        "eGFR": 95.0
    }
