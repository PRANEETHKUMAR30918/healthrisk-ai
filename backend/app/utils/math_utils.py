"""Mathematical and statistical functions for clinical algorithms."""
import numpy as np
from typing import Optional

def safe_mean(values: list[float]) -> float:
    """Calculate mean of values list safely."""
    if not values:
        return 0.0
    return float(np.mean(values))

def safe_std(values: list[float]) -> float:
    """Calculate population standard deviation (ddof=0). Returns 0.0 if empty or single value."""
    if len(values) < 2:
        return 0.0
    return float(np.std(values, ddof=0))

def safe_zscore(current: float, mean: float, std: float) -> Optional[float]:
    """Calculate Z-score safely. Avoid division by zero when standard deviation is zero."""
    if std == 0.0:
        return None
    return float((current - mean) / std)

def normalize_score(score: float, max_score: float) -> float:
    """Normalize score to [0.0, 1.0] range."""
    if max_score <= 0:
        return 0.0
    return float(min(1.0, max(0.0, score / max_score)))

def clamp(value: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    """Clamp float to [min_val, max_val]."""
    return float(max(min_val, min(max_val, value)))

def trend_direction(values: list[float]) -> str:
    """Calculate trend direction based on historical points."""
    if len(values) < 2:
        return "INSUFFICIENT_DATA"
    x = np.arange(len(values))
    y = np.array(values)
    slope, _ = np.polyfit(x, y, 1)
    
    # Normalize slope by mean to check percentage change rate
    mean_val = np.mean(y)
    rel_slope = (slope / mean_val) if mean_val != 0 else slope
    
    if rel_slope > 0.03:
        return "INCREASING"
    elif rel_slope < -0.03:
        return "DECREASING"
    else:
        return "STABLE"
