"""Engine 1: Personalized Baseline Deviation Engine implementation."""
from app.core.config import settings
from app.utils.math_utils import safe_mean, safe_std, safe_zscore, trend_direction
from .models import BaselineInput, BaselineOutput, DeviationStatus

class PersonalizedBaselineEngine:
    def analyze(self, inputs: list[BaselineInput]) -> list[BaselineOutput]:
        return [self._analyze_single(inp) for inp in inputs]

    def _analyze_single(self, inp: BaselineInput) -> BaselineOutput:
        n = len(inp.historical_values)

        # Insufficient data guard for Gaussian Z-Score (requires n >= MIN_HISTORY_COUNT for standard deviation)
        if n < settings.MIN_HISTORY_COUNT:
            hist_mean = safe_mean(inp.historical_values) if n > 0 else None
            trend = trend_direction(inp.historical_values + [inp.current_value]) if n > 0 else "FIRST_RECORD"
            expl = (
                f"Historical data available ({n} previous report{'s' if n > 1 else ''}). Evaluated against previous report ({hist_mean:.2f} {inp.current_unit}) and population bounds."
                if n > 0
                else f"Insufficient historical data ({n}/{settings.MIN_HISTORY_COUNT} required). Population reference ranges should be evaluated."
            )

            return BaselineOutput(
                biomarker_name=inp.biomarker_name,
                current_value=inp.current_value,
                current_unit=inp.current_unit,
                historical_mean=round(hist_mean, 4) if hist_mean is not None else None,
                historical_std=None,
                z_score=None,
                sample_count=n,
                deviation_status=DeviationStatus.INSUFFICIENT_HISTORY,
                data_source="POPULATION_REFERENCE",
                trend_direction=trend,
                explanation=expl
            )

        mean_val = safe_mean(inp.historical_values)
        std_val = safe_std(inp.historical_values)
        all_vals = inp.historical_values + [inp.current_value]
        trend = trend_direction(all_vals)

        # Avoid division by zero when standard deviation = 0
        z = safe_zscore(inp.current_value, mean_val, std_val)
        if z is None:
            if inp.current_value == mean_val:
                status = DeviationStatus.STABLE_BASELINE
                expl = f"Historical measurements consistently held at {mean_val:.2f} {inp.current_unit}. Current result matches this stable personal pattern."
            else:
                status = DeviationStatus.MODERATE_DEVIATION
                expl = f"Historical measurements were invariant ({mean_val:.2f} {inp.current_unit}), but current result is {inp.current_value:.2f} {inp.current_unit}. Notable shift from consistent personal baseline."
            return BaselineOutput(
                biomarker_name=inp.biomarker_name,
                current_value=inp.current_value,
                current_unit=inp.current_unit,
                historical_mean=mean_val,
                historical_std=0.0,
                z_score=None,
                sample_count=n,
                deviation_status=status,
                data_source="PERSONAL_BASELINE",
                trend_direction=trend,
                explanation=expl
            )

        # Deviation categorization based on configurable Z-score thresholds
        abs_z = abs(z)
        if abs_z < settings.BASELINE_Z_THRESHOLD_MINOR:
            status = DeviationStatus.WITHIN_BASELINE
            expl = f"Value {inp.current_value:.2f} {inp.current_unit} is consistent with personal historical mean ({mean_val:.2f} ± {std_val:.2f}, Z={z:+.2f})."
        elif abs_z < settings.BASELINE_Z_THRESHOLD_MODERATE:
            status = DeviationStatus.MINOR_DEVIATION
            expl = f"Value {inp.current_value:.2f} {inp.current_unit} displays a minor deviation from personal baseline (mean: {mean_val:.2f}, Z={z:+.2f})."
        elif abs_z < settings.BASELINE_Z_THRESHOLD_SIGNIFICANT:
            status = DeviationStatus.MODERATE_DEVIATION
            expl = f"Value {inp.current_value:.2f} {inp.current_unit} displays a moderate deviation from personal baseline (mean: {mean_val:.2f}, Z={z:+.2f}). Consider clinical review."
        else:
            status = DeviationStatus.SIGNIFICANT_DEVIATION
            expl = f"Value {inp.current_value:.2f} {inp.current_unit} reflects a significant deviation from personal baseline (mean: {mean_val:.2f}, Z={z:+.2f}). Clinical review recommended."

        return BaselineOutput(
            biomarker_name=inp.biomarker_name,
            current_value=inp.current_value,
            current_unit=inp.current_unit,
            historical_mean=round(mean_val, 4),
            historical_std=round(std_val, 4),
            z_score=round(z, 4),
            sample_count=n,
            deviation_status=status,
            data_source="PERSONAL_BASELINE",
            trend_direction=trend,
            explanation=expl
        )

    def calculate_stability(self, historical_by_biomarker: dict[str, list[float]]) -> float:
        """Calculate overall baseline stability across all patient biomarkers."""
        if not historical_by_biomarker:
            return 0.8
        scores = []
        for _, vals in historical_by_biomarker.items():
            if len(vals) >= 2:
                m = safe_mean(vals)
                s = safe_std(vals)
                cv = (s / m) if m != 0 else 0.0
                stability = max(0.0, 1.0 - min(cv, 1.0))
                scores.append(stability)
        return round(safe_mean(scores), 4) if scores else 0.8
