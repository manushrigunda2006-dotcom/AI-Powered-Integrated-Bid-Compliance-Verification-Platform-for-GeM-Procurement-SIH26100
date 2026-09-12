import { getGeminiClient, isGeminiConfigured, DEFAULT_GEMINI_MODEL, GEMINI_FALLBACK_MESSAGE } from './client';
import { RfpAnalysisResult } from './types';
import { Requirement, TenderRequiredDocument } from '../types';

function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

export async function analyzeRfpWithGemini(rfpText: string): Promise<RfpAnalysisResult> {
  if (!rfpText || rfpText.trim().length === 0) {
    throw new Error('RFP text is required for analysis');
  }

  if (!isGeminiConfigured()) {
    return getFallbackRfpAnalysis(rfpText, false);
  }

  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackRfpAnalysis(rfpText, false);
  }

  const systemInstruction =
    'You are an expert Government Procurement Compliance Advisor specializing in Indian Public Procurement, Government e-Marketplace (GeM), and General Financial Rules (GFR) 2017.\n' +
    'Analyze the provided RFP/Tender document text and extract structured procurement requirements according to GeM standards.\n\n' +
    'You MUST return a single JSON object with EXACTLY the following structure (no markdown fences, just pure JSON):\n' +
    '{\n' +
    '  "tender_number": string (e.g. "GEM/2026/B/982104"),\n' +
    '  "title": string,\n' +
    '  "department": string,\n' +
    '  "estimated_budget": number (in INR, e.g. 45000000),\n' +
    '  "budget_formatted": string (e.g. "₹4.50 Crores"),\n' +
    '  "deadline_days": number (integer, default 30),\n' +
    '  "description": string,\n' +
    '  "requirements": [\n' +
    '    {\n' +
    '      "clause_code": string (e.g. "FIN-01", "EXP-01", "STAT-01", "OEM-01", "TECH-01"),\n' +
    '      "clause_title": string,\n' +
    '      "description": string,\n' +
    '      "category": "FINANCIAL" | "EXPERIENCE" | "STATUTORY" | "TECHNICAL" | "OEM",\n' +
    '      "rule_type": "NUMERIC_GTE" | "DATE_BEFORE" | "EXACT_MATCH" | "EXISTS",\n' +
    '      "threshold_value": string,\n' +
    '      "threshold_display": string,\n' +
    '      "is_mandatory": boolean,\n' +
    '      "weight": number (integer between 5 and 25)\n' +
    '    }\n' +
    '  ],\n' +
    '  "required_documents": [\n' +
    '    {\n' +
    '      "document_type": "GST_CERT" | "UDYAM" | "OEM_AUTH" | "FINANCIAL_AUDIT" | "AFFIDAVIT_BLACKLIST" | "WORK_ORDER_EXPERIENCE" | "TECHNICAL_BID",\n' +
    '      "display_name": string,\n' +
    '      "is_mandatory": boolean\n' +
    '    }\n' +
    '  ],\n' +
    '  "key_observations": [string]\n' +
    '}';

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemInstruction },
            { text: 'RFP / Tender Text to Analyze:\n\n' + rfpText },
          ],
        },
      ],
    });

    const responseText = response.text || '';
    const cleanedJson = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleanedJson);

    return {
      tender_number: parsed.tender_number || ('GEM/2026/B/' + Math.floor(100000 + Math.random() * 900000)),
      title: parsed.title || 'Procurement Tender RFP',
      department: parsed.department || 'Department of Public Procurement & IT Infrastructure',
      estimated_budget: Number(parsed.estimated_budget) || 30000000,
      budget_formatted: parsed.budget_formatted || '₹3.00 Crores',
      deadline_days: Number(parsed.deadline_days) || 30,
      description: parsed.description || rfpText.slice(0, 300),
      requirements: (parsed.requirements || []).map((r: any, idx: number) => ({
        id: 'ai-clause-' + (idx + 1),
        tender_id: '',
        clause_code: r.clause_code || ('REQ-0' + (idx + 1)),
        clause_title: r.clause_title || 'Compliance Requirement',
        description: r.description || '',
        category: r.category || 'TECHNICAL',
        rule_type: r.rule_type || 'EXACT_MATCH',
        threshold_value: String(r.threshold_value || 'COMPLIANT'),
        threshold_display: r.threshold_display || String(r.threshold_value || 'COMPLIANT'),
        is_mandatory: r.is_mandatory ?? true,
        weight: Number(r.weight) || 15,
      })),
      required_documents: (parsed.required_documents || []).map((d: any, idx: number) => ({
        id: 'ai-req-doc-' + (idx + 1),
        tender_id: '',
        document_type: d.document_type || 'TECHNICAL_BID',
        display_name: d.display_name || ('Required_Document_' + (idx + 1) + '.pdf'),
        is_mandatory: d.is_mandatory ?? true,
        created_at: new Date().toISOString(),
      })),
      key_observations: parsed.key_observations || [
        'Extracted compliance clauses align with GeM procurement standards.',
      ],
      is_ai_generated: true,
    };
  } catch (err) {
    console.warn('Gemini RFP analysis failed, falling back to deterministic parser:', err);
    return getFallbackRfpAnalysis(rfpText, false);
  }
}

export function getFallbackRfpAnalysis(rfpText: string, isAi: boolean): RfpAnalysisResult {
  const textLower = rfpText.toLowerCase();

  const budgetMatch = rfpText.match(/(?:₹|rs\.?|inr)\s*([\d.]+)\s*(cr|crore|lakh|l)?/i);
  let estimatedBudget = 45000000;
  let budgetFormatted = '₹4.50 Crores';

  if (budgetMatch) {
    const val = parseFloat(budgetMatch[1]);
    const unit = (budgetMatch[2] || '').toLowerCase();
    if (unit.startsWith('cr')) {
      estimatedBudget = val * 10000000;
      budgetFormatted = '₹' + val.toFixed(2) + ' Crores';
    } else if (unit.startsWith('l')) {
      estimatedBudget = val * 100000;
      budgetFormatted = '₹' + val.toFixed(2) + ' Lakhs';
    }
  }

  const clauses: Requirement[] = [
    {
      id: 'clause-f-01',
      tender_id: '',
      clause_code: 'FIN-01',
      clause_title: 'Minimum Average Annual Turnover',
      description: 'CA-certified average turnover in last 3 financial years with valid UDIN.',
      category: 'FINANCIAL',
      rule_type: 'NUMERIC_GTE',
      threshold_value: '30000000',
      threshold_display: '₹3.00 Crores',
      is_mandatory: true,
      weight: 25,
    },
    {
      id: 'clause-f-02',
      tender_id: '',
      clause_code: 'EXP-01',
      clause_title: 'Past Operational Experience',
      description: 'Minimum 5 years operational experience delivering relevant enterprise solutions.',
      category: 'EXPERIENCE',
      rule_type: 'NUMERIC_GTE',
      threshold_value: '5',
      threshold_display: '5 Years Minimum',
      is_mandatory: true,
      weight: 20,
    },
    {
      id: 'clause-f-03',
      tender_id: '',
      clause_code: 'STAT-01',
      clause_title: 'Active GST Registration Status',
      description: 'Active Form GST REG-06 verified on GSTN national portal.',
      category: 'STATUTORY',
      rule_type: 'EXACT_MATCH',
      threshold_value: 'ACTIVE',
      threshold_display: 'ACTIVE',
      is_mandatory: true,
      weight: 20,
    },
    {
      id: 'clause-f-04',
      tender_id: '',
      clause_code: 'STAT-02',
      clause_title: 'CPPP Non-Debarment / Anti-Blacklisting',
      description: 'Clean standing on Central Public Procurement Portal debarment ledger under GFR Rule 151.',
      category: 'STATUTORY',
      rule_type: 'EXACT_MATCH',
      threshold_value: 'CLEAR',
      threshold_display: 'CLEAR',
      is_mandatory: true,
      weight: 20,
    },
    {
      id: 'clause-f-05',
      tender_id: '',
      clause_code: 'OEM-01',
      clause_title: 'OEM Authorization Form (MAF)',
      description: 'Original Equipment Manufacturer Authorization certificate issued for this bid.',
      category: 'OEM',
      rule_type: 'EXISTS',
      threshold_value: 'VALID_MAF',
      threshold_display: 'Valid OEM Authorization',
      is_mandatory: true,
      weight: 15,
    },
  ];

  const docs: TenderRequiredDocument[] = [
    {
      id: 'doc-f-01',
      tender_id: '',
      document_type: 'FINANCIAL_AUDIT',
      display_name: 'CA_Certified_Turnover_FY23_25.pdf',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'doc-f-02',
      tender_id: '',
      document_type: 'GST_CERT',
      display_name: 'GST_Registration_Certificate.pdf',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'doc-f-03',
      tender_id: '',
      document_type: 'WORK_ORDER_EXPERIENCE',
      display_name: 'Past_Performance_Work_Orders.pdf',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'doc-f-04',
      tender_id: '',
      document_type: 'AFFIDAVIT_BLACKLIST',
      display_name: 'Non_Blacklisting_Affidavit.pdf',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'doc-f-05',
      tender_id: '',
      document_type: 'OEM_AUTH',
      display_name: 'OEM_Manufacturer_Authorization_Form.pdf',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
  ];

  return {
    tender_number: 'GEM/2026/B/' + Math.floor(100000 + Math.random() * 900000),
    title: rfpText.slice(0, 80).split('\n')[0] || 'Enterprise Procurement Tender RFP',
    department: textLower.includes('surveillance')
      ? 'Department of Physical Infrastructure & Surveillance'
      : textLower.includes('datacenter')
      ? 'Department of Enterprise Systems & Data Infrastructure'
      : 'Department of Public Procurement & IT Infrastructure',
    estimated_budget: estimatedBudget,
    budget_formatted: budgetFormatted,
    deadline_days: 30,
    description: rfpText.slice(0, 400),
    requirements: clauses,
    required_documents: docs,
    key_observations: [
      GEMINI_FALLBACK_MESSAGE,
      'Standard GeM procurement eligibility template loaded.',
    ],
    is_ai_generated: isAi,
  };
}
