"""Normalizer for mapping biomarker aliases to standardized canonical names."""
import re
from pathlib import Path
import yaml
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

class BiomarkerNormalizer:
    def __init__(self, rules_dir: str = None):
        self.rules_dir = Path(rules_dir or settings.RULES_DIR)
        self.alias_to_canonical: dict[str, str] = {}
        self.canonical_catalog: dict[str, dict] = {}
        self._load_mappings()

    def _load_mappings(self):
        map_file = self.rules_dir / "normalization_map.yaml"
        if not map_file.exists():
            logger.warning("normalization_map_not_found", path=str(map_file))
            return

        try:
            with open(map_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            for item in data.get("biomarkers", []):
                canonical = item["canonical_name"]
                self.canonical_catalog[canonical] = item
                # Register canonical itself
                self._register_alias(canonical, canonical)
                # Register aliases
                for alias in item.get("aliases", []):
                    self._register_alias(alias, canonical)
        except Exception as e:
            logger.error("error_loading_normalization_map", error=str(e))

    def _clean_key(self, text: str) -> str:
        s = text.lower().strip()
        s = re.sub(r'[^a-z0-9]', '', s)
        return s

    def _register_alias(self, alias: str, canonical: str):
        key = self._clean_key(alias)
        if key:
            self.alias_to_canonical[key] = canonical

    def normalize(self, raw_name: str) -> str | None:
        """Return standardized canonical biomarker name or None if unmapped."""
        key = self._clean_key(raw_name)
        return self.alias_to_canonical.get(key)

    def is_plausible(self, canonical_name: str, value: float) -> bool:
        """Check if numeric reading falls within biological plausibility bounds."""
        cat = self.canonical_catalog.get(canonical_name)
        if not cat:
            return True
        p_min = cat.get("plausible_min", 0.0)
        p_max = cat.get("plausible_max", 99999.0)
        return p_min <= value <= p_max

    def get_expected_unit(self, canonical_name: str) -> str | None:
        cat = self.canonical_catalog.get(canonical_name)
        return cat.get("default_unit") if cat else None
