"""Engine 2: Physiological Consistency and Reliability Engine."""
from app.core.config import settings
from app.utils.math_utils import clamp
from .models import ConsistencyEngineOutput, RuleEvaluationResult, ConsistencyStatus
from .rule_loader import ConsistencyRuleLoader, ConsistencyRuleDefinition

class PhysiologicalConsistencyEngine:
    def __init__(self, rules_dir: str = None):
        self.rule_loader = ConsistencyRuleLoader(rules_dir)

    def analyze(
        self,
        biomarker_values: dict[str, float],
        avg_extraction_confidence: float = 1.0,
        baseline_stability: float = 0.8
    ) -> ConsistencyEngineOutput:
        results = []
        total_eval_weight = 0.0
        violation_weight = 0.0

        for rule in self.rule_loader.rules:
            res = self._evaluate_rule(rule, biomarker_values)
            results.append(res)
            if res.status != ConsistencyStatus.MISSING_DATA:
                total_eval_weight += rule.weight
                if res.status == ConsistencyStatus.REVIEW_REQUIRED:
                    violation_weight += rule.weight

        # Consistency Score = 1 - (violation_weight / total_weight)
        if total_eval_weight > 0:
            c_score = 1.0 - (violation_weight / total_eval_weight)
        else:
            c_score = 1.0
        c_score = clamp(c_score)

        # Reliability Score = w1 * Consistency + w2 * Confidence + w3 * Baseline Stability
        w1 = settings.CONSISTENCY_W1
        w2 = settings.CONSISTENCY_W2
        w3 = settings.CONSISTENCY_W3
        rel_score = (w1 * c_score) + (w2 * avg_extraction_confidence) + (w3 * baseline_stability)
        rel_score = clamp(rel_score)

        return ConsistencyEngineOutput(
            consistency_score=round(c_score, 4),
            reliability_score=round(rel_score, 4),
            avg_extraction_confidence=round(avg_extraction_confidence, 4),
            baseline_stability=round(baseline_stability, 4),
            rule_results=results
        )

    def _evaluate_rule(self, rule: ConsistencyRuleDefinition, values: dict[str, float]) -> RuleEvaluationResult:
        val_a = values.get(rule.biomarker_a)
        val_b = values.get(rule.biomarker_b)

        if val_a is None or val_b is None:
            missing = []
            if val_a is None: missing.append(rule.biomarker_a)
            if val_b is None: missing.append(rule.biomarker_b)
            return RuleEvaluationResult(
                rule_id=rule.id,
                biomarker_a=rule.biomarker_a,
                biomarker_b=rule.biomarker_b,
                observed_a=val_a,
                observed_b=val_b,
                expected_relationship=rule.relationship,
                status=ConsistencyStatus.MISSING_DATA,
                is_consistent=None,
                explanation=f"Cannot evaluate relationship: {', '.join(missing)} not reported.",
                weight=rule.weight
            )

        is_consistent, reason = self._check_physiological_relation(rule, val_a, val_b)
        status = ConsistencyStatus.CONSISTENT if is_consistent else ConsistencyStatus.REVIEW_REQUIRED

        if is_consistent:
            expl = f"{rule.biomarker_a} ({val_a:.2f}) and {rule.biomarker_b} ({val_b:.2f}) demonstrate biologically expected alignment."
        else:
            expl = f"Potential inconsistency detected between {rule.biomarker_a} ({val_a:.2f}) and {rule.biomarker_b} ({val_b:.2f}). {reason} {rule.explanation_template}"

        return RuleEvaluationResult(
            rule_id=rule.id,
            biomarker_a=rule.biomarker_a,
            biomarker_b=rule.biomarker_b,
            observed_a=val_a,
            observed_b=val_b,
            expected_relationship=rule.relationship,
            status=status,
            is_consistent=is_consistent,
            explanation=expl,
            weight=rule.weight
        )

    def _check_physiological_relation(self, rule: ConsistencyRuleDefinition, val_a: float, val_b: float) -> tuple[bool, str]:
        rel = rule.relationship
        if rel == "hb_rbc_check":
            # Hemoglobin (g/dL) and RBC (10^6/uL). Normal MCH is Hb*10/RBC approx 24-36 pg
            if val_b <= 0: return False, "Invalid RBC denominator."
            mch = (val_a * 10.0) / val_b
            if mch < 18.0 or mch > 42.0:
                return False, f"Estimated mean corpuscular hemoglobin ({mch:.1f} pg) falls outside physiological plausibility range."
            return True, ""

        elif rel == "rbc_mcv_check":
            # RBC * MCV / 10 is estimated Hematocrit (%)
            approx_hct = (val_a * val_b) / 10.0
            if approx_hct < 18.0 or approx_hct > 68.0:
                return False, f"Calculated product of RBC and MCV gives improbable hematocrit equivalent ({approx_hct:.1f}%)."
            return True, ""

        elif rel == "glucose_hba1c_check":
            # Chronic HbA1c vs acute fasting glucose
            # Average glucose ~ 28.7 * HbA1c - 46.7
            if val_b <= 0: return False, "Invalid HbA1c."
            est_glu = 28.7 * val_b - 46.7
            # If glucose > 220 but HbA1c < 5.2 or glucose < 65 and HbA1c > 9.0
            if (val_a > 220.0 and val_b < 5.2) or (val_a < 65.0 and val_b > 9.0):
                return False, f"Marked divergence between acute glucose ({val_a:.1f}) and chronic glycemic marker HbA1c ({val_b:.1f}%)."
            return True, ""

        elif rel == "hb_hct_check":
            # Rule of three: Hct (%) ~ 3 * Hb (g/dL)
            expected_hct = 3.0 * val_a
            diff = abs(val_b - expected_hct)
            if diff > (expected_hct * (rule.tolerance_pct / 100.0) + 4.0):
                return False, f"Observed hematocrit ({val_b:.1f}%) diverges notably from 3x hemoglobin rule ({expected_hct:.1f}%)."
            return True, ""

        elif rel == "tc_ldl_check":
            # Total Cholesterol should exceed LDL
            if val_b > (val_a + 5.0):
                return False, f"Observed LDL ({val_b:.1f}) is higher than Total Cholesterol ({val_a:.1f}), which violates lipid fractionation constraints."
            return True, ""

        return True, ""
