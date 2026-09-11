import { getGeminiClient, isGeminiConfigured, DEFAULT_GEMINI_MODEL } from './client';
import { ClauseExplanationItem } from './types';
import { Bidder, ComplianceResult, Tender } from '../types';

function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

export async function generateComplianceExplanationsWithGemini(params: {
  bidder: Bidder;
  tender?: Tender;
  clauseResults: ComplianceResult[];
}): Promise<Record<string, ClauseExplanationItem>> {
  const { bidder, tender, clauseResults } = params;

  if (!isGeminiConfigured()) {
    return getFallbackClauseExplanations(clauseResults);
  }

  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackClauseExplanations(clauseResults);
  }

  const clausesContext = clauseResults.map((c) => ({
    code: c.clause_code,
    title: c.clause_title,
    category: c.category,
    status: c.status,
    threshold: c.threshold_display,
    extracted: c.extracted_display,
    is_mandatory: c.is_mandatory,
  }));

  const prompt =
    'You are an expert Government Procurement Compliance Officer for Indian GeM procurement and GFR 2017.\n' +
    'Review the deterministic evaluation results for bidder "' + bidder.company_name + '" (GSTIN: ' + bidder.gst_number + ') on tender "' + (tender?.title || 'GeM Tender') + '".\n\n' +
    'Clauses evaluated:\n' + JSON.stringify(clausesContext, null, 2) + '\n\n' +
    'For EACH clause code, generate an explanation JSON object where the key is the clause code:\n' +
    '{\n' +
    '  "clause_code": {\n' +
    '    "clause_code": string,\n' +
    '    "clause_title": string,\n' +
    '    "status": "COMPLIANT" | "NON_COMPLIANT" | "INCONSISTENT" | "MISSING_DOC" | "FLAGGED",\n' +
    '    "statutory_ground": string (e.g. "GFR 2017 Rule 151", "Public Procurement Policy for MSEs Order 2012", "Section 25 of CGST Act"),\n' +
    '    "plain_english_explanation": string (2-3 sentences explaining exactly why this passed, failed, or requires officer attention),\n' +
    '    "gfr_or_gem_rule_ref": string (specific statutory citation)\n' +
    '  }\n' +
    '}\n\n' +
    'Return ONLY valid JSON with clause codes as keys. Do not include markdown code fences.';

  try {
    const res = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = res.text || '';
    const cleanedJson = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleanedJson);
    const result: Record<string, ClauseExplanationItem> = {};

    for (const c of clauseResults) {
      if (parsed[c.clause_code]) {
        result[c.clause_code] = {
          clause_code: c.clause_code,
          clause_title: c.clause_title,
          status: c.status,
          statutory_ground: parsed[c.clause_code].statutory_ground || 'General Financial Rules 2017',
          plain_english_explanation: parsed[c.clause_code].plain_english_explanation || c.human_explanation,
          gfr_or_gem_rule_ref: parsed[c.clause_code].gfr_or_gem_rule_ref || 'GFR 2017',
        };
      } else {
        result[c.clause_code] = getDefaultExplanationForClause(c);
      }
    }

    return result;
  } catch (err) {
    console.warn('Gemini compliance explanation error, falling back:', err);
    return getFallbackClauseExplanations(clauseResults);
  }
}

export function getFallbackClauseExplanations(
  clauseResults: ComplianceResult[]
): Record<string, ClauseExplanationItem> {
  const map: Record<string, ClauseExplanationItem> = {};
  for (const c of clauseResults) {
    map[c.clause_code] = getDefaultExplanationForClause(c);
  }
  return map;
}

function getDefaultExplanationForClause(c: ComplianceResult): ClauseExplanationItem {
  let statutory = 'General Financial Rules 2017 (Rule 144)';
  let gfrRef = 'GFR 2017 Rule 144';

  if (c.category === 'FINANCIAL') {
    statutory = 'GFR 2017 Rule 144(xi) - Financial Competency & CA Certification';
    gfrRef = 'GFR Rule 144(xi)';
  } else if (c.category === 'STATUTORY' && c.clause_code.includes('03')) {
    statutory = 'Section 25 of CGST Act 2017 & GeM Special Terms of Procurement';
    gfrRef = 'CGST Act 2017 Sec 25';
  } else if (c.category === 'STATUTORY' && (c.clause_code.includes('04') || c.clause_title.toLowerCase().includes('black'))) {
    statutory = 'GFR 2017 Rule 151 - Debarment from Bidding';
    gfrRef = 'GFR Rule 151';
  } else if (c.category === 'OEM') {
    statutory = 'GeM General Terms & Conditions (GTC) Clause 4(xii) - Manufacturer Authorization';
    gfrRef = 'GeM GTC 4(xii)';
  } else if (c.clause_title.toLowerCase().includes('msme') || c.clause_title.toLowerCase().includes('udyam')) {
    statutory = 'Public Procurement Policy for Micro and Small Enterprises (MSEs) Order 2012';
    gfrRef = 'PPP-MSE Order 2012';
  }

  return {
    clause_code: c.clause_code,
    clause_title: c.clause_title,
    status: c.status,
    statutory_ground: statutory,
    plain_english_explanation: c.human_explanation || ('Clause ' + c.clause_code + ' evaluated deterministically against tender specification.'),
    gfr_or_gem_rule_ref: gfrRef,
  };
}
