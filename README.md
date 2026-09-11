# 🏛️ AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement (SIH26100)
### Smart India Hackathon (SIH) • RegTech / GovTech Innovation MVP

An explainable, human-in-the-loop verification and compliance engine designed for Government Procurement Officers on the **Government e-Marketplace (GeM)**.

The system combines deterministic compliance rules, document verification, simulated government registry adapters, bidder cross-entity checks, dynamic risk scoring, and immutable audit trails to make procurement evaluation faster, more transparent, and tamper-evident.

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
|                                   |   |  • Cross-Document Entity Name Match       |
+-----------------------------------+   +-------------------------------------------+
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
├── public/                      # Static assets & visual badges
├── python_engine/               # Core reference deterministic verification engine
│   ├── adapters.py              # GSTN, Udyam, Debarment external adapters
│   ├── normalizers.py           # Indian currency & corporate name normalizers
│   └── test_engine.py           # Verification unit tests
├── src/
│   ├── app/
│   │   ├── api/                 # API Routes (evaluate, decision, export-65b, tenders)
│   │   ├── tenders/             # Tenders list, RFP creation, bidder evaluation matrix
│   │   ├── audit-logs/          # Cryptographic immutable audit logs
│   │   ├── profile/             # Procurement officer profile & DSC credentials
│   │   └── page.tsx             # Homepage hero & SIH workflow overview
│   ├── components/              # UI components (ComplianceMatrix, RiskGauge, Header)
│   ├── lib/
│   │   ├── adapters/            # TypeScript registry adapters (GSTN, Udyam, Debarment)
│   │   ├── engine/              # TypeScript deterministic evaluator & scoring engine
│   │   ├── normalizers/         # Currency & entity normalizers
│   │   └── supabase.ts          # Supabase client & environment helpers
│   └── services/                # Business logic services (bidders, audit, compliance)
└── supabase/
    └── full_setup.sql           # Complete Supabase schema, RLS policies & indexes
```

---

## 🚀 Key Features
- **Tender/RFP Creation & Management**: Configure mandatory clauses, turnover thresholds, and statutory criteria.
- **Automated Compliance & Eligibility Engine**: 100% deterministic rule verification without generative hallucination.
- **External Registry Adapters**: Simulated live latency adapters for GSTN (tax compliance), Udyam (MSE status), and CPPP (central debarment blacklist).
- **Cross-Entity Fuzzy Matching**: Corporate name normalizer with Levenshtein distance cross-checking to detect subcontracting shell entities.
- **Dynamic Bidder Risk Scoring**: Weighted composite scoring (0-100) with automatic disqualification overrides for statutory breaches.
- **Evidence-Based Compliance Matrix**: Interactive breakdown of statutory criteria with one-click modal evidence inspection.
- **Human Officer Review & Adjudication**: Explainable decision dock for final human-in-the-loop qualification.
- **Digital Signatures & Officer Credentialing**: Certified audit sign-offs with officer profiles.
- **Immutable Audit Timeline**: Cryptographic audit trails with SHA-256 hash tracking and GFR Rule 151 compliance verification.
- **Section 65B Certificate Export**: Instant generation and download of 65B Electronic Evidence Verification Certificates.

---

## 🧪 Demo Scenario (Tender: Cloud Migration & Modernization RFP)
1. **Bidder 1: BCDE Technologies Private Limited**
   - **Score**: 94/100 • **Risk**: 🟢 LOW (Compliant)
   - **Status**: CA-audited turnover of ₹5.20 Cr (exceeds ₹3.0 Cr threshold), 7 years track record, GST active (Score: 98%), Udyam Medium MSE verified, CPPP Clear, OEM MAF matches entity name exactly.

2. **Bidder 2: CDEF Solutions Private Limited**
   - **Score**: 76/100 • **Risk**: 🟡 MEDIUM (Officer Clarification Required)
   - **Status**: Turnover of ₹3.15 Cr meets threshold, but **Cross-Document Entity Name Mismatch** detected between GST certificate (*CDEF Solutions Private Limited*) and OEM Authorization (*CDEF Solutions Technologies Pvt Ltd*). Levenshtein distance triggers `⚠️ ENTITY_NAME_MISMATCH`.

3. **Bidder 3: DEFG Systems Limited**
   - **Score**: 28/100 • **Risk**: 🔴 HIGH (Disqualification Recommended)
   - **Status**: Fatal statutory breaches: Listed in **CPPP Central Debarment Registry** (Order MOD/PROC/DEBAR/2023/1892), GST registration is **CANCELLED**, turnover is sub-par (₹1.80 Cr), and OEM Authorization is **MISSING**. Automatic override caps score and mandates disqualification under GFR Rule 151.

---

## 🛡️ Standards & Statutory Compliance
- **General Financial Rules (GFR) 2017**: Rule 151 debarment enforcement.
- **Central Vigilance Commission (CVC)**: Explainable reasoning for rejection.
- **Public Procurement Policy for MSEs (PPP-MSE)**: Udyam MSME verification.
- **Indian Evidence Act**: Section 65B electronic compliance certificate generation.
