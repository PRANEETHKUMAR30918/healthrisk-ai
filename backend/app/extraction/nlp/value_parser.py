"""Regex and string parser for clinical numeric values, units, and intervals."""
import re
from dataclasses import dataclass
from typing import Optional

@dataclass
class ParsedRowValue:
    numeric_value: Optional[float]
    unit: Optional[str]
    ref_low: Optional[float]
    ref_high: Optional[float]
    abnormal_flag: Optional[bool]
    raw_text: str

UNIT_REGEX = re.compile(
    r'\b('
    r'g/dL|g/L|mg/dL|mg/L|mmol/L|umol/L|'
    r'%|10\^3/uL|10\^6/uL|x10\^3/uL|x10\^6/uL|'
    r'fL|pg|pg/mL|ng/mL|ug/mL|ug/dL|'
    r'mL/min/1\.73m2|U/L|IU/L|IU/mL|'
    r'uIU/mL|mEq/L|mIU/L|nmol/L|pmol/L|'
    r'cells/cmm|mill/cmm|mm/hr|mm/h'
    r')\b',
    re.IGNORECASE
)

RANGE_REGEX = re.compile(
    r'(?<!\w)([0-9]+\.?[0-9]*)\s*-\s*([0-9]+\.?[0-9]*)(?!\w)'
)
UPPER_BOUND_REGEX = re.compile(r'<\s*([0-9]+\.?[0-9]*)')   # e.g. < 5.7
LOWER_BOUND_REGEX = re.compile(r'>\s*([0-9]+\.?[0-9]*)')   # e.g. > 60
NUMBER_REGEX = re.compile(r'(?<![a-zA-Z])([0-9]+\.?[0-9]*)(?![a-zA-Z])')
# Only match full-word flag tokens — NOT single letters inside words like ALT, mEq/L
FLAG_REGEX = re.compile(r'(?<!\w)(HIGH|LOW|\*|ABNORMAL|NORMAL)(?!\w)', re.IGNORECASE)

def parse_line_values(text: str) -> ParsedRowValue:
    """Parse numeric laboratory findings, units, and reference brackets from text."""
    ref_low, ref_high = None, None
    ref_text_span = None   # track what we stripped as the reference

    # Try two-value range first: "70 - 100"
    range_match = RANGE_REGEX.search(text)
    if range_match:
        try:
            ref_low = float(range_match.group(1))
            ref_high = float(range_match.group(2))
            ref_text_span = range_match.span()
        except ValueError:
            pass

    # Try single upper-bound: "< 5.7"
    if ref_low is None and ref_high is None:
        ub_match = UPPER_BOUND_REGEX.search(text)
        if ub_match:
            try:
                ref_high = float(ub_match.group(1))
                ref_text_span = ub_match.span()
            except ValueError:
                pass

    # Try single lower-bound: "> 60"
    if ref_low is None and ref_high is None:
        lb_match = LOWER_BOUND_REGEX.search(text)
        if lb_match:
            try:
                ref_low = float(lb_match.group(1))
                ref_text_span = lb_match.span()
            except ValueError:
                pass

    # Unit
    unit = None
    unit_match = UNIT_REGEX.search(text)
    if unit_match:
        unit = unit_match.group(1)

    # Strip reference range text and trailing status words before extracting value
    clean_text = text
    if ref_text_span:
        start, end = ref_text_span
        clean_text = text[:start] + " " + text[end:]
    # Remove < X and > X bound patterns that remain in the text
    clean_text = re.sub(r'[<>]\s*[0-9]+\.?[0-9]*', ' ', clean_text)
    # Remove status words like "Abnormal", "Normal"
    clean_text = re.sub(r'\b(Abnormal|Normal|High|Low)\b', ' ', clean_text, flags=re.IGNORECASE)
    # Remove parenthetical groups which are part of biomarker names e.g. (25-OH), (K+), (CKD-EPI)
    clean_text = re.sub(r'\([^)]*\)', ' ', clean_text)

    numeric_value = None
    # Strategy: if a unit was detected, pick the number immediately preceding the unit
    if unit_match:
        # Search in clean_text for a number right before where the unit appears
        unit_pos = clean_text.find(unit_match.group(0))
        if unit_pos == -1:
            # unit was already removed from clean_text; find last number overall
            nums_before = NUMBER_REGEX.findall(clean_text)
            if nums_before:
                try:
                    numeric_value = float(nums_before[-1])
                except ValueError:
                    pass
        else:
            # Find number immediately before the unit position
            pre_unit = clean_text[:unit_pos].rstrip()
            nums_pre = NUMBER_REGEX.findall(pre_unit)
            if nums_pre:
                try:
                    numeric_value = float(nums_pre[-1])  # last number before unit = observed value
                except ValueError:
                    pass
    else:
        num_matches = NUMBER_REGEX.findall(clean_text)
        if num_matches:
            try:
                numeric_value = float(num_matches[0])
            except ValueError:
                pass

    # Determine abnormal flag
    abnormal_flag = None
    flag_match = FLAG_REGEX.search(text)
    if flag_match:
        f = flag_match.group(1).upper()
        abnormal_flag = f in ("HIGH", "H", "*", "ABNORMAL")
    elif numeric_value is not None:
        if ref_low is not None and ref_high is not None:
            abnormal_flag = numeric_value < ref_low or numeric_value > ref_high
        elif ref_high is not None:
            # < X style: abnormal if value > limit (e.g. HbA1c 8.2 > 5.7)
            abnormal_flag = numeric_value > ref_high
        elif ref_low is not None:
            # > X style: abnormal if value < limit (e.g. eGFR 56 < 60)
            abnormal_flag = numeric_value < ref_low

    return ParsedRowValue(
        numeric_value=numeric_value,
        unit=unit,
        ref_low=ref_low,
        ref_high=ref_high,
        abnormal_flag=abnormal_flag,
        raw_text=text
    )

