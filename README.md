# 🏛️ GeM Automated Verification & Compliance Assistant
### Smart India Hackathon (SIH) • RegTech / GovTech Innovation MVP

An explainable, human-in-the-loop verification and compliance engine designed for Government Procurement Officers on the **Government e-Marketplace (GeM)**. 

The system automates the ingestion of Tender RFPs, parses Bidder document packets, runs strict deterministic rule-based compliance checks, simulates live external government registry validations via an extensible adapter pattern, calculates dynamic composite risk scores, and presents evidence-backed audit trails to procurement officers for final human adjudication.

---

## 🎯 Key Architectural Pillars

```
+-----------------------------------------------------------------------------------+
|                           Tender RFP & Bidder Documents                           |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|               1. Extractor & Document Intelligence (Pluggable)                    |
|  • Indian Currency Normalizer (Lakhs / Crores / ₹ commas -> Float)                |
|  • Corporate Entity Normalizer (Suffix stripping, Levenshtein distance)           |
+-----------------------------------------------------------------------------------+
                     │                                   │
                     ▼                                   ▼
+-----------------------------------+   +-------------------------------------------+
| 2. External Registry Adapters     |   | 3. Deterministic Rule Engine              |
|    (Simulated Latencies 200-400ms)|   |    (Zero Generative Hallucination)        |
|  • GSTNAdapter (Active, Tax Score)|   |  • Turnover Check (CA UDIN validated)     |
|  • UdyamAdapter (MSE Category)    |   |  • Past Experience Check (Years)          |
|  • DebarmentAdapter (CPPP Blacklist)   • Statutory Expiry Check (Valid Date)      |
+-----------------------------------+   |  • Cross-Document Entity Name Match       |
                     │                  +-------------------------------------------+
                     │                                   │
                     └───────────────────┬───────────────┘
                                         ▼
+-----------------------------------------------------------------------------------+
|                     4. Dynamic Risk & Scoring Engine (0 - 100)                    |
|  • Mandatory Failure Override: Blacklist / Expired GST / Missing OEM MAF          |
|    automatically caps score and forces Risk Level to HIGH (Disqualified)         |
|  • Minor Variances: Levenshtein distance 0 < d <= 0.20 flags MEDIUM Risk          |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                       5. Officer Human-in-the-Loop Dock                           |
|  • Pre-filled AI Executive Summary                                                |
|  • Final Adjudication: [Approve Qualification] | [Disqualify] | [Clarification]    |
|  • Tamper-Evident Immutable Audit Log Trail                                      |
+-----------------------------------------------------------------------------------+
```

---

## 🗂️ Project Structure

```
gem-compliance-assistant/
├── prisma/
│   └── schema.prisma            # Full PostgreSQL schema with 7 models & relationships
├── python_engine/               # Dedicated Python 3.11+ / Pydantic V2 engine
│   ├── models.py                # Pydantic validation schemas
│   ├── normalizers.py           # Currency & Levenshtein entity matcher
│   ├── adapters.py              # Abstract VerificationAdapter, GSTN, Udyam, Debarment
│   └── test_engine.py           # Standalone automated test suite
├── src/
│   ├── app/
│   │   ├── layout.tsx           # GeM GovTech tricolor header & container
│   │   ├── page.tsx             # Active Tenders Dashboard
│   │   ├── tenders/[id]/
│   │   │   └── bidders/
│   │   │       ├── page.tsx     # Bidder Overview Table with Risk badges & scores
│   │   │       └── [bidderId]/verification/
│   │   │           └── page.tsx # 3-Pane Hero Verification Screen (35% / 45% / 20%)
│   │   └── api/
│   │       ├── tenders/route.ts # Fetch tender and bidder packets
│   │       ├── evaluate/route.ts# Execute deterministic verification pipeline
│   │       └── decision/route.ts# Commit officer adjudication to audit log
│   ├── components/
│   │   ├── Header.tsx           # Indian Tricolor & GeM Navigation bar
│   │   ├── RiskGauge.tsx        # Circular SVG animated risk & score gauge
│   │   ├── RegistryBadge.tsx    # Live GSTN, Udyam, Debarment registry badges
│   │   ├── ComplianceMatrix.tsx # Clause-by-clause evaluation cards with citations
│   │   ├── OfficerActionDock.tsx# Decision buttons & immutable remarks dock
│   │   ├── EvidenceModal.tsx    # PDF OCR snippet viewer with bounding box
│   │   └── AuditTimeline.tsx    # Immutable chronological audit trail modal
│   └── lib/
│       ├── types.ts             # Production-ready TypeScript domain types
│       ├── utils.ts             # Badge, date, and currency helpers
│       ├── normalizers/
│       │   ├── currency.ts      # Indian currency parser (Lakhs, Crores, ₹)
│       │   └── entity.ts        # Levenshtein distance & corporate entity normalizer
│       ├── adapters/
│       │   ├── base.ts          # Abstract VerificationAdapter base class
│       │   ├── gstn.ts          # GSTN Verification Adapter
│       │   ├── udyam.ts         # Udyam MSME Verification Adapter
│       │   ├── debarment.ts     # CPPP Debarment / Blacklist Adapter
│       │   └── index.ts         # Concurrent registry orchestrator
│       ├── engine/
│       │   ├── evaluator.ts     # Deterministic clause evaluator
│       │   ├── scoring.ts       # Dynamic scoring & executive summary synthesizer
│       │   └── service.ts       # In-memory store & verification pipeline
│       └── mock-data/
│           └── tender-seed.ts   # Realistic GeM RFP seed with 3 diverse bidders
```

---

## ⚡ Quick Start Instructions

### 1. Run the Full Next.js 14 Application
```bash
cd gem-compliance-assistant
npm install
npm run build
npx next start -p 3005
```
Open **`http://localhost:3005`** in your browser.

- **Home Page**: `http://localhost:3005/`
- **Tender Bidders Overview**: `http://localhost:3005/tenders/tender-gem-2026-cloud/bidders`
- **Hero Verification Screen**: `http://localhost:3005/tenders/tender-gem-2026-cloud/bidders/bidder-01/verification`

### 2. Run the Python Engine Test Suite
```bash
cd gem-compliance-assistant/python_engine
python test_engine.py
```
Expected output:
```
ALL PYTHON ENGINE TESTS PASSED DETERMINISTICALLY! [OK]
```

---

## 👥 Three Seeded Bidder Personas

1. **Bidder 1: Bharat Datatech Solutions Private Limited**
   - **Score**: 96/100 • **Risk**: 🟢 LOW (Eligible for Technical Qualification)
   - **Status**: CA-audited turnover of ₹5.20 Cr (exceeds ₹3.0 Cr threshold), 7 years track record, GST active (Score: 98%), Udyam Medium MSE verified, CPPP Clear, Dell OEM MAF matches entity name exactly.

2. **Bidder 2: Apex Infoways India Private Limited**
   - **Score**: 76/100 • **Risk**: 🟡 MEDIUM (Officer Clarification Required)
   - **Status**: Turnover of ₹3.15 Cr meets threshold, but **Cross-Document Entity Name Mismatch** detected between GST certificate (*Apex Infoways India Private Limited*) and Cisco OEM Authorization (*Apex Infoways Technologies Pvt Ltd*). Levenshtein distance triggers `⚠️ ENTITY_NAME_MISMATCH`.

3. **Bidder 3: Global Nexus Technologies Limited**
   - **Score**: 28/100 • **Risk**: 🔴 HIGH (Disqualification Recommended)
   - **Status**: Fatal statutory breaches: Listed in **CPPP Central Debarment Registry** (Order MOD/PROC/DEBAR/2023/1892), GST registration is **CANCELLED**, turnover is sub-par (₹1.80 Cr), and OEM Authorization is **MISSING**. Automatic override caps score and mandates disqualification under GFR Rule 151.

---

## 🛡️ Standards & Statutory Compliance
- **General Financial Rules (GFR) 2017**: Rule 151 debarment enforcement.
- **Central Vigilance Commission (CVC)**: Explainable reasoning for rejection.
- **Public Procurement Policy for MSEs (PPP-MSE)**: Udyam MSME verification.
