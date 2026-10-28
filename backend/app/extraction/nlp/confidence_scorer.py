"""Calculates extraction confidence score per biomarker."""
from dataclasses import dataclass

@dataclass
class ConfidenceFactors:
    has_numeric_value: bool
    has_unit: bool
    has_reference_range: bool
    is_canonical_match: bool
    unit_matches_expected: bool
    value_in_plausible_range: bool
    ocr_confidence: float = 1.0

def calculate_extraction_confidence(factors: ConfidenceFactors) -> float:
    """Calculate normalized confidence score [0.0 - 1.0]."""
    score = 0.0
    if factors.has_numeric_value:
        score += 0.30
    if factors.is_canonical_match:
        score += 0.25
    if factors.has_unit:
        score += 0.15
    if factors.unit_matches_expected:
        score += 0.10
    if factors.has_reference_range:
        score += 0.10
    if factors.value_in_plausible_range:
        score += 0.10

    # Weight by OCR confidence
    final_score = score * (0.8 + 0.2 * factors.ocr_confidence)
    return round(min(1.0, max(0.0, final_score)), 4)
