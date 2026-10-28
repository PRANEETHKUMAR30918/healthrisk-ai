"""Patient-friendly Health Summary generator."""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.health_summary import HealthSummary

class SummaryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_summary(self, report_id: uuid.UUID, baseline_outputs: list, consistency_out, risk_out) -> HealthSummary:
        # Construct key findings using clinical safety language
        findings = []
        recommendations = []
        sections = []

        # 1. Baseline highlights
        mod_sig_deviations = [b for b in baseline_outputs if "deviation" in b.deviation_status.value.lower()]
        if mod_sig_deviations:
            dev_names = [f"{b.biomarker_name} (Z={b.z_score:+.2f})" for b in mod_sig_deviations if b.z_score is not None]
            findings.append(f"Personal baseline deviations noted for: {', '.join(dev_names)}.")
            sections.append({
                "title": "Personalized Longitudinal Baseline Analysis",
                "content": "Several parameters showed a measurable deviation from your personal historical pattern. Even if values remain near conventional reference intervals, personal deviations can represent an early physiological trend."
            })
            recommendations.append("Discuss personal baseline shifts with your physician to assess longitudinal stability.")
        else:
            sections.append({
                "title": "Personalized Longitudinal Baseline Analysis",
                "content": "Current laboratory values remain broadly consistent with your recorded historical baseline or standard population reference distributions."
            })

        # 2. Consistency highlights
        review_rules = [r for r in consistency_out.rule_results if r.status.value == "REVIEW_REQUIRED"]
        if review_rules:
            findings.append(f"{len(review_rules)} laboratory parameter pair(s) flagged for consistency review.")
            sections.append({
                "title": "Biological Consistency Cross-Checks",
                "content": "Specific biomarker relationships (such as between Hemoglobin and RBC counts or Glycemic indicators) displayed biological discordance. This pattern may be caused by sample timing, extraction nuances, or biological variation."
            })
            recommendations.append("Consider verifying flagged values with the testing laboratory to rule out analytical artifacts.")
        else:
            sections.append({
                "title": "Biological Consistency Cross-Checks",
                "content": "Analyzed parameter pairs satisfy physiological consistency checks with a reliability score of " + f"{consistency_out.reliability_score * 100:.1f}%."
            })

        # 3. Multi-test Risk highlights
        flagged_cats = [c for c in risk_out.risk_category_results if c.is_flagged]
        if flagged_cats:
            cat_names = [c.risk_category_name for c in flagged_cats]
            findings.append(f"Multi-test pattern flags identified for: {', '.join(cat_names)}.")
            sections.append({
                "title": "Multi-Test Risk Indicators",
                "content": f"The aggregate model identified elevated multi-parameter risk patterns for: {', '.join(cat_names)}. These risk indicators synthesize multiple interrelated lab findings rather than evaluating single tests in isolation."
            })
            recommendations.append("Share these multi-test risk indicators with a qualified healthcare professional for formal clinical evaluation.")
        else:
            sections.append({
                "title": "Multi-Test Risk Indicators",
                "content": "No multi-parameter disease risk thresholds were breached based on the current laboratory panel."
            })

        # Mandatory closing recommendations
        recommendations.append("Maintain routine preventive checkups according to age and general clinical guidelines.")
        recommendations.append("Do NOT alter prescription medications or commence treatments without consulting your physician.")

        disclaimer = (
            "IMPORTANT MEDICAL DISCLAIMER: This health summary is produced by an academic research and "
            "clinical decision-support prototype. It does NOT provide a definitive diagnosis, does NOT replace a "
            "doctor, and must NOT be used to prescribe medicines or make medical treatment choices. All interpretations "
            "must be verified by a qualified healthcare professional."
        )

        patient_friendly_text = (
            f"Overall Risk Tier: {risk_out.risk_tier.value}\n\n"
            f"Key Findings:\n" + "\n".join(f"- {f}" for f in findings) + "\n\n"
            f"Recommendations:\n" + "\n".join(f"- {r}" for r in recommendations)
        )

        # Save to DB
        stmt = select(HealthSummary).where(HealthSummary.report_id == report_id)
        res = await self.db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            existing.overall_risk_index = risk_out.overall_health_risk_index
            existing.risk_tier = risk_out.risk_tier.value
            existing.summary_sections_json = sections
            existing.patient_friendly_text = patient_friendly_text
            existing.key_findings_json = findings
            existing.recommendations_json = recommendations
            existing.disclaimer = disclaimer
            existing.generated_by = "DETERMINISTIC_TEMPLATE"
            summary = existing
        else:
            summary = HealthSummary(
                report_id=report_id,
                overall_risk_index=risk_out.overall_health_risk_index,
                risk_tier=risk_out.risk_tier.value,
                summary_sections_json=sections,
                patient_friendly_text=patient_friendly_text,
                key_findings_json=findings,
                recommendations_json=recommendations,
                disclaimer=disclaimer,
                generated_by="DETERMINISTIC_TEMPLATE"
            )
            self.db.add(summary)

        await self.db.commit()
        await self.db.refresh(summary)
        return summary
