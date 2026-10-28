"""Engine 1 data contracts."""
from dataclasses import dataclass
from typing import Optional
from enum import Enum

class DeviationStatus(str, Enum):
    WITHIN_BASELINE = "Within personal baseline"
    MINOR_DEVIATION = "Minor deviation from personal pattern"
    MODERATE_DEVIATION = "Moderate deviation — consider review"
    SIGNIFICANT_DEVIATION = "Significant deviation — clinical review recommended"
    STABLE_BASELINE = "Stable historical pattern"
    INSUFFICIENT_HISTORY = "Insufficient historical data"

@dataclass
class BaselineInput:
    biomarker_name: str
    current_value: float
    current_unit: str
    historical_values: list[float]

@dataclass
class BaselineOutput:
    biomarker_name: str
    current_value: float
    current_unit: str
    historical_mean: Optional[float]
    historical_std: Optional[float]
    z_score: Optional[float]
    sample_count: int
    deviation_status: DeviationStatus
    data_source: str
    trend_direction: str
    explanation: str
