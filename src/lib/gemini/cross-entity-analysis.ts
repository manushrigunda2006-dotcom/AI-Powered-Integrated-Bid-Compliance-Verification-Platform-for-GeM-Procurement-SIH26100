import { getGeminiClient, isGeminiConfigured, DEFAULT_GEMINI_MODEL } from './client';
import { CrossEntityAnalysisResult } from './types';

function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

export async function analyzeCrossEntityWithGemini(params: {
  gstEntityName: string;
  oemEntityName: string;
  bankEntityName?: string;
  levenshteinDistance: number;
  similarityRatio: number;
  companyName: string;
}): Promise<CrossEntityAnalysisResult> {
  const {
    gstEntityName,
    oemEntityName,
    bankEntityName,
    levenshteinDistance,
    similarityRatio,
    companyName,
  } = params;

  if (!isGeminiConfigured()) {
    return getFallbackCrossEntityAnalysis(params, false);
  }

  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackCrossEntityAnalysis(params, false);
  }

  const prompt =
    'You are a Senior Legal & Compliance Officer evaluating procurement documentation on the Government e-Marketplace (GeM).\n' +
    'Evaluate this entity name cross-verification mismatch across bidder documents:\n\n' +
    'Bidder Registered Name: "' + companyName + '"\n' +
    'Name on GST REG-06 Certificate: "' + gstEntityName + '"\n' +
    'Name on OEM Manufacturer Authorization Form (MAF): "' + oemEntityName + '"\n' +
    (bankEntityName ? ('Name on Bank Account / Cheque: "' + bankEntityName + '"\n') : '') +
    'Levenshtein Distance: ' + levenshteinDistance + '\n' +
    'Levenshtein Similarity Ratio: ' + (similarityRatio * 100).toFixed(1) + '%\n\n' +
    'Provide an objective assessment in JSON format with fields:\n' +
    '{\n' +
    '  "is_coherent": boolean,\n' +
    '  "explanation": string (Plain-English summary explaining how and why the names differ, e.g. parent company vs operating subsidiary vs trading style vs distinct legal entity),\n' +
    '  "legal_implications": string (Potential legal or contractual risks under the Indian Contract Act 1872 and GFR 2017 if awarded to an entity with name discrepancies),\n' +
    '  "recommended_action": string (Actionable steps for the procurement officer, e.g., require board resolution / clarification letter from OEM confirming authorization / certificate of incorporation)\n' +
    '}\n\n' +
    'Return ONLY valid JSON without markdown code fences.';

  try {
    const res = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = res.text || '';
    const cleanedJson = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleanedJson);

    return {
      is_coherent: Boolean(parsed.is_coherent),
      levenshtein_distance: levenshteinDistance,
      similarity_ratio: similarityRatio,
      explanation: parsed.explanation || 'Name variation detected between registered GST entity and OEM authorization.',
      legal_implications: parsed.legal_implications || 'Potential privity of contract dispute under GFR 2017 if OEM does not back the specific entity submitting the bid.',
      recommended_action: parsed.recommended_action || 'Issue clarification request to bidder seeking OEM confirmation.',
      is_ai_generated: true,
    };
  } catch (err) {
    console.warn('Gemini cross-entity analysis error, falling back:', err);
    return getFallbackCrossEntityAnalysis(params, false);
  }
}

export function getFallbackCrossEntityAnalysis(
  params: {
    gstEntityName: string;
    oemEntityName: string;
    bankEntityName?: string;
    levenshteinDistance: number;
    similarityRatio: number;
  },
  isAi: boolean
): CrossEntityAnalysisResult {
  const hasMismatch = params.levenshteinDistance > 3 || params.similarityRatio > 0.15;

  if (hasMismatch) {
    return {
      is_coherent: false,
      levenshtein_distance: params.levenshteinDistance,
      similarity_ratio: params.similarityRatio,
      explanation: 'Variance detected: GST certificate records "' + params.gstEntityName + '", whereas OEM Authorization Form states "' + params.oemEntityName + '". Levenshtein distance is ' + params.levenshteinDistance + ' (' + (params.similarityRatio * 100).toFixed(0) + '% variance).',
      legal_implications: 'Under GFR 2017 and Indian Contract Act, privity of contract requires the contracting entity to hold valid manufacturer backing. A legal entity variance may render OEM warranty and SLA support legally unenforceable.',
      recommended_action: 'Procurement Officer should issue a formal clarification under GeM GTC requiring the bidder to produce an amended OEM MAF bearing the exact GST legal name, or a registered Corporate Affidavit evidencing 100% subsidiary relationship.',
      is_ai_generated: isAi,
    };
  }

  return {
    is_coherent: true,
    levenshtein_distance: params.levenshteinDistance,
    similarity_ratio: params.similarityRatio,
    explanation: 'Entity names match across GST registration ("' + params.gstEntityName + '") and OEM documentation with high fidelity.',
    legal_implications: 'Clean corporate identity confirmed. No privity of contract or warranty enforceability risk detected.',
    recommended_action: 'Proceed with technical and financial evaluation.',
    is_ai_generated: isAi,
  };
}
