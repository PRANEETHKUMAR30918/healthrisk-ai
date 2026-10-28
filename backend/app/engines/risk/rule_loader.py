"""YAML loader for multi-test risk analysis rules."""
import yaml
from pathlib import Path
from dataclasses import dataclass, field
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

@dataclass
class RiskFeatureRule:
    biomarker: str
    weight: float

@dataclass
class RiskCategoryRule:
    id: str
    display_name: str
    severity_weight: float
    alpha_threshold: float
    features: list[RiskFeatureRule] = field(default_factory=list)
    enabled: bool = True

class RiskRuleLoader:
    def __init__(self, rules_dir: str = None):
        self.rules_dir = Path(rules_dir or settings.RULES_DIR)
        self.categories: list[RiskCategoryRule] = []
        self._load()

    def _load(self):
        p = self.rules_dir / "risk_rules.yaml"
        if not p.exists():
            logger.warning("risk_rules_file_not_found", path=str(p))
            return
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            for c in data.get("risk_categories", []):
                if c.get("enabled", True):
                    feats = [RiskFeatureRule(f["biomarker"], float(f["weight"])) for f in c.get("features", [])]
                    self.categories.append(RiskCategoryRule(
                        id=c["id"],
                        display_name=c["display_name"],
                        severity_weight=float(c.get("severity_weight", 1.0)),
                        alpha_threshold=float(c.get("alpha_threshold", 0.5)),
                        features=feats,
                        enabled=True
                    ))
        except Exception as e:
            logger.error("risk_rules_load_failed", error=str(e))
