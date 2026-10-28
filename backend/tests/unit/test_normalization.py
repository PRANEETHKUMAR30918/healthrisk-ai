"""Unit tests for Biomarker Normalizer."""
import pytest
from app.extraction.normalization.normalizer import BiomarkerNormalizer

@pytest.fixture
def normalizer():
    return BiomarkerNormalizer()

def test_hemoglobin_alias_mappings(normalizer):
    for alias in ["Hb", "HGB", "haemoglobin", "Hemoglobin", "Blood Hemoglobin"]:
        assert normalizer.normalize(alias) == "Hemoglobin"

def test_glucose_alias_mappings(normalizer):
    for alias in ["FBG", "FPG", "Fasting Blood Sugar", "fasting blood glucose", "FBS"]:
        assert normalizer.normalize(alias) == "Fasting Blood Glucose"

def test_unrecognized_returns_none(normalizer):
    assert normalizer.normalize("Nonexistent Strange Test X12") is None

def test_plausibility_check(normalizer):
    assert normalizer.is_plausible("Hemoglobin", 14.5) is True
    assert normalizer.is_plausible("Hemoglobin", 150.0) is False
