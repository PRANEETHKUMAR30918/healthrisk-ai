"""Engine 3: Prioritized Multi-Test Risk Engine implementation."""
from app.utils.math_utils import normalize_score, clamp
from .models import RiskEngineOutput, RiskCategoryResult, RiskTier, FactorScore
from .rule_loader import RiskRuleLoader, RiskCategoryRule

class MultiTestRiskEngine:
    def __init__(self, rules_dir: str = None):
        self.rule_loader = RiskRuleLoader(rules_dir)

    def analyze(
        self,
        biomarker_values: dict[str, float],
        abnormal_flags: dict[str, bool],
        baseline_deviations: dict[str, float] = None
    ) -> RiskEngineOutput:
        deviations = baseline_deviations or {}
        cat_results = []
        total_sev_weight = 0.0
        weighted_risk_sum = 0.0

        for cat in self.rule_loader.categories:
            res = self._score_category(cat, biomarker_values, abnormal_flags, deviations)
            cat_results.append(res)
            total_sev_weight += cat.severity_weight
            weighted_risk_sum += res.severity_weighted_score

        # Overall Health Risk Index (HRI)
        overall_hri = (weighted_risk_sum / total_sev_weight) if total_sev_weight > 0 else 0.0
        overall_hri = clamp(overall_hri)
        tier = self._get_tier(overall_hri)

        return RiskEngineOutput(
            overall_health_risk_index=round(overall_hri, 4),
            risk_tier=tier,
            risk_category_results=cat_results
        )

    def _score_category(
        self,
        cat: RiskCategoryRule,
        values: dict[str, float],
        flags: dict[str, bool],
        deviations: dict[str, float]
    ) -> RiskCategoryResult:
        factors = []
        disease_score = 0.0
        max_possible_score = sum(f.weight for f in cat.features)

        for feat in cat.features:
            val = values.get(feat.biomarker)
            flag = flags.get(feat.biomarker)
            z = deviations.get(feat.biomarker, 0.0)

            # Feature: 1 = abnormal, 0 = normal (or 0.5 for moderate personal baseline deviation)
            if flag is not None and flag:
                f_score = 1.0
            elif abs(z) >= 2.0:
                f_score = 0.5
            else:
                f_score = 0.0

            disease_score += f_score * feat.weight
            factors.append(FactorScore(
                biomarker=feat.biomarker,
                value=val,
                abnormal=bool(flag) if flag is not None else False,
                weight=feat.weight,
                feature_score=f_score
            ))

        # Threshold = alpha * sum of all weights
        threshold = cat.alpha_threshold * max_possible_score
        is_flagged = disease_score >= threshold and disease_score > 0

        # Normalized Risk = Disease Score / Maximum Score
        norm_risk = normalize_score(disease_score, max_possible_score)

        # Weighted Risk = Normalized Risk * Severity Weight
        weighted_risk = norm_risk * cat.severity_weight

        contributing = [f.biomarker for f in factors if f.feature_score > 0]
        if contributing:
            expl = f"Multiple abnormal findings or significant deviations contributed ({', '.join(contributing)}). Risk indicator score: {norm_risk:.2f}."
        else:
            expl = f"No significant parameter abnormalities identified for {cat.display_name}."

        return RiskCategoryResult(
            risk_category_id=cat.id,
            risk_category_name=cat.display_name,
            normalized_score=round(norm_risk, 4),
            severity_weight=cat.severity_weight,
            severity_weighted_score=round(weighted_risk, 4),
            is_flagged=is_flagged,
            contributing_factors=factors,
            explanation=expl
        )

    def _get_tier(self, hri: float) -> RiskTier:
        if hri < 0.20:
            return RiskTier.LOW
        elif hri < 0.40:
            return RiskTier.MILD
        elif hri < 0.65:
            return RiskTier.MODERATE
        else:
            return RiskTier.ELEVATED
