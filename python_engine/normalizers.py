"""
Python Normalizers: Indian Currency & Levenshtein Corporate Entity Matching
"""

import re
from typing import Any, Tuple


def parse_indian_currency(val: Any) -> float:
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)

    s = str(val).strip().upper()
    if not s:
        return 0.0

    # 1. Crores
    cr_match = re.search(r"([\d.]+)\s*(?:CR|CRORE|CRORES)", s)
    if cr_match:
        try:
            return round(float(cr_match.group(1)) * 10_000_000, 2)
        except ValueError:
            return 0.0

    # 2. Lakhs
    lakh_match = re.search(r"([\d.]+)\s*(?:LAKH|LAKHS|LAC|LACS)", s)
    if lakh_match:
        try:
            return round(float(lakh_match.group(1)) * 100_000, 2)
        except ValueError:
            return 0.0

    # 3. Numeric string with commas
    clean = re.sub(r"[^\d.]", "", s)
    try:
        return float(clean)
    except ValueError:
        return 0.0


def normalize_entity_name(name: str) -> str:
    if not name:
        return ""
    s = name.lower()
    s = re.sub(r"[.,/#!$%^&*;:{}=\-_`~()]", " ", s)
    s = re.sub(r"\bprivate\s+limited\b", " ", s)
    s = re.sub(r"\bpvt\s+ltd\b", " ", s)
    s = re.sub(r"\blimited\b", " ", s)
    s = re.sub(r"\bltd\b", " ", s)
    s = re.sub(r"\bllp\b", " ", s)
    s = re.sub(r"\btechnologies\b", " ", s)
    s = re.sub(r"\btechnology\b", " ", s)
    s = re.sub(r"\bsolutions\b", " ", s)
    s = re.sub(r"\bindia\b", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def levenshtein_distance(s1: str, s2: str) -> int:
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[m][n]


def cross_verify_entities(entity_a: str, entity_b: str) -> Tuple[str, float]:
    """
    Returns (Status, NormalizedDistance).
    If Levenshtein distance ratio > 0 and < 0.2: 'ENTITY_NAME_MISMATCH'
    If missing: 'CRITICAL_MISSING'
    """
    if not entity_a or not entity_b:
        return ("CRITICAL_MISSING", 1.0)

    norm_a = normalize_entity_name(entity_a)
    norm_b = normalize_entity_name(entity_b)

    if norm_a == norm_b:
        return ("EXACT_MATCH", 0.0)

    dist = levenshtein_distance(norm_a, norm_b)
    max_len = max(len(norm_a), len(norm_b), 1)
    ratio = dist / max_len

    if 0.0 < ratio <= 0.20:
        return ("ENTITY_NAME_MISMATCH", round(ratio, 3))
    return ("CRITICAL_MISMATCH", round(ratio, 3))
