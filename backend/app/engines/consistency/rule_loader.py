"""YAML-based loader for biological consistency rules."""
import yaml
from pathlib import Path
from dataclasses import dataclass
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

@dataclass
class ConsistencyRuleDefinition:
    id: str
    biomarker_a: str
    biomarker_b: str
    relationship: str
    tolerance_pct: float
    weight: float
    explanation_template: str
    enabled: bool = True

class ConsistencyRuleLoader:
    def __init__(self, rules_dir: str = None):
        self.rules_dir = Path(rules_dir or settings.RULES_DIR)
        self.rules: list[ConsistencyRuleDefinition] = []
        self._load()

    def _load(self):
        rule_path = self.rules_dir / "consistency_rules.yaml"
        if not rule_path.exists():
            logger.warning("consistency_rules_file_not_found", path=str(rule_path))
            return
        try:
            with open(rule_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            for r in data.get("rules", []):
                if r.get("enabled", True):
                    self.rules.append(ConsistencyRuleDefinition(
                        id=r["id"],
                        biomarker_a=r["biomarker_a"],
                        biomarker_b=r["biomarker_b"],
                        relationship=r["relationship"],
                        tolerance_pct=float(r.get("tolerance_pct", 20.0)),
                        weight=float(r.get("weight", 1.0)),
                        explanation_template=r.get("explanation_template", ""),
                        enabled=True
                    ))
        except Exception as e:
            logger.error("consistency_rules_load_failed", error=str(e))
