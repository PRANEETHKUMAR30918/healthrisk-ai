"""Clinical information extraction using NLP rules and spaCy Named Entity candidate detection."""
import re
from dataclasses import dataclass
from typing import Optional
from app.extraction.normalization.normalizer import BiomarkerNormalizer
from app.extraction.nlp.value_parser import parse_line_values
from app.extraction.nlp.confidence_scorer import ConfidenceFactors, calculate_extraction_confidence
from app.core.logging import get_logger

logger = get_logger(__name__)

@dataclass
class ExtractedBiomarker:
    biomarker_name_raw: str
    biomarker_name_canonical: Optional[str]
    numeric_value: Optional[float]
    unit: Optional[str]
    ref_low: Optional[float]
    ref_high: Optional[float]
    abnormal_flag: Optional[bool]
    confidence_score: float
    source_location: str
    needs_review: bool

class BiomarkerExtractor:
    def __init__(self, normalizer: BiomarkerNormalizer):
        self.normalizer = normalizer
        self._nlp = None

    def _get_nlp(self):
        if self._nlp is None:
            try:
                import spacy
                self._nlp = spacy.load("en_core_web_sm")
            except Exception:
                logger.info("spacy_en_core_web_sm_not_loaded_using_rule_nlp")
                self._nlp = False
        return self._nlp

    def extract_from_tables(self, tables: list[list[list[str]]], source_location: str = "table") -> list[ExtractedBiomarker]:
        results = []
        for t_idx, tbl in enumerate(tables):
            for r_idx, row in enumerate(tbl):
                if len(row) < 2:
                    continue
                name_cell = row[0].strip()
                canonical = self.normalizer.normalize(name_cell)
                if not canonical and len(row) > 2:
                    # Check if second cell was test name
                    canonical = self.normalizer.normalize(row[1].strip())
                    if canonical:
                        name_cell = row[1].strip()

                if not canonical:
                    continue

                full_row_str = " | ".join(row)
                parsed = parse_line_values(full_row_str)
                if parsed.numeric_value is None:
                    continue

                factors = ConfidenceFactors(
                    has_numeric_value=True,
                    has_unit=bool(parsed.unit),
                    has_reference_range=parsed.ref_low is not None and parsed.ref_high is not None,
                    is_canonical_match=True,
                    unit_matches_expected=bool(parsed.unit and parsed.unit.lower() == (self.normalizer.get_expected_unit(canonical) or "").lower()),
                    value_in_plausible_range=self.normalizer.is_plausible(canonical, parsed.numeric_value),
                    ocr_confidence=1.0
                )
                conf = calculate_extraction_confidence(factors)

                results.append(ExtractedBiomarker(
                    biomarker_name_raw=name_cell,
                    biomarker_name_canonical=canonical,
                    numeric_value=parsed.numeric_value,
                    unit=parsed.unit or self.normalizer.get_expected_unit(canonical),
                    ref_low=parsed.ref_low,
                    ref_high=parsed.ref_high,
                    abnormal_flag=parsed.abnormal_flag,
                    confidence_score=conf,
                    source_location=f"{source_location} {t_idx+1}:row {r_idx+1}",
                    needs_review=(conf < 0.65)
                ))
        return results

    # Patterns that indicate free-text clinical commentary (not data rows)
    _NOTE_PATTERNS = [
        r'^\*',
        r'^DISCLAIMER',
        r'indicate',
        r'suggestive of',
        r'consistent with',
        r'supplementation',
        r'clinical information',
        r'healthcare professional',
    ]

    def _is_note_line(self, line: str) -> bool:
        import re as _re
        if len(line) > 120:
            return True
        lc = line.lower()
        for pat in self._NOTE_PATTERNS:
            if _re.search(pat, lc):
                return True
        return False

    def extract_from_text(self, text: str, source_location: str = "text", ocr_conf: float = 1.0) -> list[ExtractedBiomarker]:
        results = []
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        for l_idx, line in enumerate(lines):
            # Skip clinical commentary / note lines
            if self._is_note_line(line):
                continue

            # Check candidate biomarker substrings
            matched_canonical = None
            matched_raw = None

            # Look through all registered aliases
            for alias_key, canonical in self.normalizer.alias_to_canonical.items():
                pattern = rf'\b{re.escape(alias_key)}\b'
                # Check cleaned text match
                clean_l = re.sub(r'[^a-z0-9\s]', ' ', line.lower())
                if re.search(pattern, clean_l):
                    matched_canonical = canonical
                    matched_raw = line[:30]
                    break

            if not matched_canonical:
                continue

            parsed = parse_line_values(line)
            if parsed.numeric_value is None:
                continue

            factors = ConfidenceFactors(
                has_numeric_value=True,
                has_unit=bool(parsed.unit),
                has_reference_range=parsed.ref_low is not None and parsed.ref_high is not None,
                is_canonical_match=True,
                unit_matches_expected=bool(parsed.unit and parsed.unit.lower() == (self.normalizer.get_expected_unit(matched_canonical) or "").lower()),
                value_in_plausible_range=self.normalizer.is_plausible(matched_canonical, parsed.numeric_value),
                ocr_confidence=ocr_conf
            )
            conf = calculate_extraction_confidence(factors)

            results.append(ExtractedBiomarker(
                biomarker_name_raw=matched_raw or matched_canonical,
                biomarker_name_canonical=matched_canonical,
                numeric_value=parsed.numeric_value,
                unit=parsed.unit or self.normalizer.get_expected_unit(matched_canonical),
                ref_low=parsed.ref_low,
                ref_high=parsed.ref_high,
                abnormal_flag=parsed.abnormal_flag,
                confidence_score=conf,
                source_location=f"{source_location}:line {l_idx+1}",
                needs_review=(conf < 0.65)
            ))
        return results
