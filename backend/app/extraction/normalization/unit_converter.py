"""Harmonization of laboratory units to standardized canonical representations."""

CONVERSION_FACTORS = {
    # Glucose: mmol/L to mg/dL
    ("mmol/L", "mg/dL", "Fasting Blood Glucose"): 18.0182,
    ("mmol/L", "mg/dL", "Postprandial Blood Glucose"): 18.0182,
    # Cholesterol: mmol/L to mg/dL
    ("mmol/L", "mg/dL", "Total Cholesterol"): 38.67,
    ("mmol/L", "mg/dL", "HDL"): 38.67,
    ("mmol/L", "mg/dL", "LDL"): 38.67,
    # Triglycerides: mmol/L to mg/dL
    ("mmol/L", "mg/dL", "Triglycerides"): 88.57,
}

def standardize_unit(value: float, from_unit: str, canonical_biomarker: str, target_unit: str) -> float:
    """Convert measurement into standardized reporting unit if known conversion exists."""
    if not from_unit or not target_unit or from_unit.lower() == target_unit.lower():
        return value
    key = (from_unit, target_unit, canonical_biomarker)
    factor = CONVERSION_FACTORS.get(key)
    if factor:
        return value * factor
    return value
