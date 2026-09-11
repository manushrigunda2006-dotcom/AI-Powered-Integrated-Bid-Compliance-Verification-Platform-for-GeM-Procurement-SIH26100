"""
Python Deterministic Engine Unit Tests
Tests currency normalizer, Levenshtein cross-entity mismatch detection, and debarment rejection.
"""

import asyncio
from normalizers import parse_indian_currency, cross_verify_entities, normalize_entity_name
from adapters import GSTNAdapter, DebarmentAdapter


def test_currency_normalizer():
    assert parse_indian_currency("5.5 Cr") == 55_000_000.0
    assert parse_indian_currency("₹ 2,50,00,000") == 25_000_000.0
    assert parse_indian_currency("50 Lakhs") == 5_000_000.0
    assert parse_indian_currency(3500000) == 3500000.0


def test_entity_normalization():
    assert normalize_entity_name("ABC Technologies Pvt Ltd") == "abc"
    assert normalize_entity_name("ABC Technology Private Limited") == "abc"
    assert normalize_entity_name("BCDE Technologies Private Limited") == "bcde"


def test_cross_entity_verification():
    # Exact match after suffix normalization
    status, ratio = cross_verify_entities(
        "BCDE Technologies Private Limited",
        "BCDE Technologies Pvt Ltd"
    )
    assert status == "EXACT_MATCH"

    # Mild typo / naming variation (Levenshtein > 0 and <= 0.2)
    status_mismatch, ratio_mismatch = cross_verify_entities(
        "CDEF Solutions Private Limited",
        "CDEF Solutionz Private Limited"
    )
    assert status_mismatch == "ENTITY_NAME_MISMATCH"
    assert 0.0 < ratio_mismatch <= 0.20

    # Missing entity
    status_missing, _ = cross_verify_entities("", "Some Corp")
    assert status_missing == "CRITICAL_MISSING"


def test_debarment_adapter():
    adapter = DebarmentAdapter()

    # Clear vendor
    res_clear = asyncio.run(adapter.verify({"pan": "AAACB1234F"}))
    assert res_clear["data"]["is_blacklisted"] is False
    assert res_clear["data"]["status"] == "CLEAR"

    # Blacklisted vendor
    res_debarred = asyncio.run(adapter.verify({"pan": "AAACD9999L"}))
    assert res_debarred["data"]["is_blacklisted"] is True
    assert res_debarred["data"]["status"] == "DEBARRED"
    assert "Ministry of Defence" in res_debarred["data"]["agency"]


if __name__ == "__main__":
    test_currency_normalizer()
    test_entity_normalization()
    test_cross_entity_verification()
    test_debarment_adapter()
    print("ALL PYTHON ENGINE TESTS PASSED DETERMINISTICALLY! [OK]")
