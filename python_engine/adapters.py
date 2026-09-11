"""
Python External Registry Adapters with Simulated Latencies
"""

import asyncio
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class VerificationAdapter(ABC):
    @property
    @abstractmethod
    def adapter_name(self) -> str:
        pass

    @property
    @abstractmethod
    def source_endpoint(self) -> str:
        pass

    async def verify(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        # Simulate 200-400ms network roundtrip
        await asyncio.sleep(0.25)
        data = await self.execute_verification(payload)
        elapsed_ms = round((time.time() - start) * 1000, 2)
        return {
            "success": True,
            "adapter": self.adapter_name,
            "endpoint": self.source_endpoint,
            "latency_ms": elapsed_ms,
            "data": data,
        }

    @abstractmethod
    async def execute_verification(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        pass


class GSTNAdapter(VerificationAdapter):
    adapter_name = "GSTN_REGISTRY_ADAPTER_V2"
    source_endpoint = "https://api.gstn.gov.in/taxpayerapi/v1.2/search/taxpayer"

    async def execute_verification(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        gstin = payload.get("gstin", "").upper()
        if gstin.startswith("33AAACD"):
            return {
                "gstin": gstin,
                "status": "CANCELLED",
                "tax_compliance_score": 34,
                "filing_frequency": "QUARTERLY",
                "is_active": False,
            }
        return {
            "gstin": gstin,
            "status": "ACTIVE",
            "tax_compliance_score": 96,
            "filing_frequency": "MONTHLY",
            "is_active": True,
        }


class UdyamAdapter(VerificationAdapter):
    adapter_name = "MSME_UDYAM_REGISTRY_ADAPTER"
    source_endpoint = "https://udyamregistration.gov.in/api/v1/verifyEnterprise"

    async def execute_verification(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        udyam = payload.get("udyam_number", "")
        return {
            "udyam_number": udyam,
            "category": "Medium" if "DL" in udyam else "Small",
            "is_verified": True,
            "major_activity": "Services",
        }


class DebarmentAdapter(VerificationAdapter):
    adapter_name = "CPPP_CENTRAL_DEBARMENT_REGISTRY"
    source_endpoint = "https://eprocure.gov.in/cppp/api/v2/debarment/lookup"

    async def execute_verification(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        pan = payload.get("pan", "").upper()
        # Simulated blacklist
        if pan == "AAACD9999L":
            return {
                "pan": pan,
                "is_blacklisted": True,
                "status": "DEBARRED",
                "agency": "Ministry of Defence",
                "order_no": "MOD/PROC/DEBAR/2023/1892",
            }
        return {
            "pan": pan,
            "is_blacklisted": False,
            "status": "CLEAR",
        }
