import { getGeminiClient, isGeminiConfigured, DEFAULT_GEMINI_MODEL, GEMINI_FALLBACK_MESSAGE } from './client';
import { RiskExplanationResult } from './types';
import { Bidder, Tender, VerificationEvaluationReport } from '../types';

function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

export async function generateRiskAssessmentExplanationWithGemini(params: {
  bidder: Bidder;
  tender: Tender;
  report: VerificationEvaluationReport;
}): Promise<RiskExplanationResult> {
  const { bidder, tender, report } = params;

  if (!isGeminiConfigured()) {
    return getFallbackRiskExplanation(report, false);
  }

  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackRiskExplanation(report, false);
  }

  const contextData = {
    bidder_name: bidder.company_name,
    gstin: bidder.gst_number,
    pan: bidder.pan_number,
    tender_title: tender.title,
    tender_budget: tender.budget_formatted,
    deterministic_score: report.overall_score,
    risk_level: report.risk_level,
    mandatory_failures: report.mandatory_clause_failures,
    minor_discrepancies: report.minor_discrepancies,
    gst_status: report.registry_summary?.gstn?.status,
    gst_compliance_score: report.registry_summary?.gstn?.tax_compliance_score,
    cppp_blacklist_status: report.registry_summary?.debarment?.status,
    cppp_agency: report.registry_summary?.debarment?.debarring_agency,
    cppp_reason: report.registry_summary?.debarment?.reason,
    cross_entity: report.cross_entity_check,
  };

  const prompt =
    'You are a Chief Vigilance & Procurement Adjudication Officer for Government e-Marketplace (GeM).\n' +
    'Review this deterministic compliance report and generate an executive risk assessment briefing for the human Procurement Officer.\n\n' +
    'Evaluation Data:\n' + JSON.stringify(contextData, null, 2) + '\n\n' +
    'IMPORTANT RULES:\n' +
    '1. You MUST NOT change the overall score (' + report.overall_score + ') or risk level (' + report.risk_level + ').\n' +
    '2. Provide an executive summary strictly synthesizing the facts without hallucinating.\n' +
    '3. Highlight specific red flags (e.g., CPPP blacklisting, cancelled GSTIN, OEM name mismatch).\n' +
    '4. Provide actionable, step-by-step recommendations for the human officer before committing an adjudication decision.\n\n' +
    'Return ONLY a JSON object with this structure:\n' +
    '{\n' +
    '  "risk_level": "' + report.risk_level + '",\n' +
    '  "overall_score": ' + report.overall_score + ',\n' +
    '  "executive_summary": string (3-4 sentences synthesizing the compliance posture),\n' +
    '  "detected_concerns": [string],\n' +
    '  "officer_recommendations": [string],\n' +
    '  "gfr_compliance_notes": [string]\n' +
    '}\n\n' +
    'Return raw JSON only, without markdown code fences.';

  try {
    const res = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = res.text || '';
    const cleanedJson = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleanedJson);

    return {
      risk_level: report.risk_level,
      overall_score: report.overall_score,
      executive_summary: parsed.executive_summary || report.executive_summary,
      detected_concerns: parsed.detected_concerns || report.mandatory_clause_failures,
      officer_recommendations: parsed.officer_recommendations || [
        'Review audit trail log before committing final officer signature.',
      ],
      gfr_compliance_notes: parsed.gfr_compliance_notes || [
        'GFR 2017 Rule 151: Mandatory disqualification applies for active debarment.',
      ],
      is_ai_generated: true,
    };
  } catch (err) {
    console.warn('Gemini risk assessment error, falling back:', err);
    return getFallbackRiskExplanation(report, false);
  }
}

export function getFallbackRiskExplanation(
  report: VerificationEvaluationReport,
  isAi: boolean
): RiskExplanationResult {
  const concerns: string[] = [];
  const recommendations: string[] = [];
  const gfrNotes: string[] = [];

  if (report.risk_level === 'HIGH') {
    concerns.push(...report.mandatory_clause_failures);
    if (report.registry_summary?.debarment?.is_blacklisted) {
      concerns.push(
        'Active national debarment on CPPP portal by ' + (report.registry_summary.debarment.debarring_agency || 'Government Authority')
      );
      recommendations.push(
        'GFR Rule 151 Disqualification: Issue statutory rejection notice citing order ' +
          (report.registry_summary.debarment.order_number || 'CPPP listing')
      );
      gfrNotes.push(
        'GFR 2017 Rule 151(i): A bidder debarred by any public authority shall not participate in public procurement.'
      );
    }
    if (report.registry_summary?.gstn?.status === 'CANCELLED') {
      concerns.push('GST registration is CANCELLED on GSTN portal.');
      recommendations.push(
        'Verify GST cancellation notice with state tax authority before financial evaluation.'
      );
    }
  } else if (report.risk_level === 'MEDIUM') {
    concerns.push(...report.minor_discrepancies);
    if (report.cross_entity_check?.warning_flag) {
      concerns.push(
        'Entity Name Variance: GST name "' + report.cross_entity_check.gst_entity_name + '" vs MAF name "' + report.cross_entity_check.oem_entity_name + '"'
      );
      recommendations.push(
        'Request clarification from bidder within 48 hours for OEM Authorization alignment.'
      );
      gfrNotes.push(
        'GeM GTC Clause 4(xii): Bidder must demonstrate unquestioned manufacturer authorization.'
      );
    }
  } else {
    recommendations.push(
      'All mandatory eligibility and statutory criteria verified. Proceed to Commercial / L1 Evaluation.'
    );
    gfrNotes.push(
      'GFR 2017 Rule 144: Satisfies all technical and financial minimum qualifications.'
    );
  }

  return {
    risk_level: report.risk_level,
    overall_score: report.overall_score,
    executive_summary: report.executive_summary,
    detected_concerns: concerns.length > 0 ? concerns : ['No material compliance concerns detected.'],
    officer_recommendations: recommendations,
    gfr_compliance_notes: gfrNotes,
    is_ai_generated: isAi,
  };
}
