/**
 * Corporate Legal Entity Normalization & Cross-Entity Verification
 * Normalizes Indian corporate entity variations (Pvt Ltd vs Private Limited, etc.)
 * Computes deterministic Levenshtein distance & detects subtle name mismatches.
 */

/**
 * Standardize company name by stripping legal designations, special characters, and extra spaces.
 */
export function normalizeEntityName(name: string | null | undefined): string {
  if (!name) return '';

  return name
    .toLowerCase()
    // Replace punctuation with space
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    // Normalize common Indian corporate suffixes
    .replace(/\bprivate\s+limited\b/g, ' ')
    .replace(/\bpvt\s+ltd\b/g, ' ')
    .replace(/\bprvt\s+ltd\b/g, ' ')
    .replace(/\bpvt\s+limited\b/g, ' ')
    .replace(/\blimited\b/g, ' ')
    .replace(/\bltd\b/g, ' ')
    .replace(/\bllp\b/g, ' ')
    .replace(/\bllc\b/g, ' ')
    .replace(/\bcorp\b/g, ' ')
    .replace(/\bcorporation\b/g, ' ')
    .replace(/\bco\b/g, ' ')
    .replace(/\bcompany\b/g, ' ')
    .replace(/\binc\b/g, ' ')
    .replace(/\benterprise\b/g, ' ')
    .replace(/\benterprises\b/g, ' ')
    .replace(/\bsolutions\b/g, ' ')
    .replace(/\btechnologies\b/g, ' ')
    .replace(/\btechnology\b/g, ' ')
    .replace(/\bindia\b/g, ' ')
    // Consolidate whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate Levenshtein Distance between two strings
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const s1 = a.trim().toLowerCase();
  const s2 = b.trim().toLowerCase();

  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Normalized Levenshtein distance ratio between 0.0 (identical) and 1.0 (completely distinct)
 */
export function calculateNormalizedDistance(a: string, b: string): number {
  const normA = normalizeEntityName(a);
  const normB = normalizeEntityName(b);

  if (!normA && !normB) return 0;
  if (!normA || !normB) return 1.0;
  if (normA === normB) return 0;

  const dist = calculateLevenshteinDistance(normA, normB);
  const maxLen = Math.max(normA.length, normB.length);
  return dist / maxLen;
}

export interface CrossEntityVerificationReport {
  isMatch: boolean;
  status: 'EXACT_MATCH' | 'ENTITY_NAME_MISMATCH' | 'CRITICAL_MISMATCH' | 'CRITICAL_MISSING';
  rawDistance: number;
  normalizedDistance: number;
  similarityPercentage: number;
  badge: string;
  explanation: string;
}

/**
 * Strict cross-check across documents (e.g. GST certificate vs OEM authorization vs Bank Guarantee)
 * Requirements rule:
 * If Levenshtein distance > 0 but < 0.2, flag as `⚠️ ENTITY_NAME_MISMATCH`.
 * If missing, flag as `❌ CRITICAL_MISSING`.
 */
export function crossVerifyEntities(
  primaryEntity: string | null | undefined,
  secondaryEntity: string | null | undefined,
  doc1Label = 'GST Certificate',
  doc2Label = 'OEM Authorization'
): CrossEntityVerificationReport {
  if (!primaryEntity || !secondaryEntity || !primaryEntity.trim() || !secondaryEntity.trim()) {
    return {
      isMatch: false,
      status: 'CRITICAL_MISSING',
      rawDistance: 999,
      normalizedDistance: 1.0,
      similarityPercentage: 0,
      badge: '❌ CRITICAL_MISSING',
      explanation: `Critical Missing Data: Legal entity name is absent in ${!primaryEntity ? doc1Label : doc2Label}. Cannot perform cross-document entity verification.`
    };
  }

  const rawDist = calculateLevenshteinDistance(primaryEntity, secondaryEntity);
  const normDist = calculateNormalizedDistance(primaryEntity, secondaryEntity);
  const similarity = Math.max(0, Math.round((1 - normDist) * 100));

  if (normDist === 0) {
    return {
      isMatch: true,
      status: 'EXACT_MATCH',
      rawDistance: 0,
      normalizedDistance: 0,
      similarityPercentage: 100,
      badge: '✅ VERIFIED_COHERENT',
      explanation: `Entity names match coherently between ${doc1Label} ("${primaryEntity}") and ${doc2Label} ("${secondaryEntity}").`
    };
  }

  // If distance ratio > 0 but < 0.2 (similarity 80% to 99.9%)
  if (normDist > 0 && normDist <= 0.20) {
    return {
      isMatch: false,
      status: 'ENTITY_NAME_MISMATCH',
      rawDistance: rawDist,
      normalizedDistance: Number(normDist.toFixed(3)),
      similarityPercentage: similarity,
      badge: '⚠️ ENTITY_NAME_MISMATCH',
      explanation: `Entity name variation detected between ${doc1Label} ("${primaryEntity}") and ${doc2Label} ("${secondaryEntity}"). Normalized distance: ${normDist.toFixed(2)} (${similarity}% similarity). Officer review required for typographical or legal name alignment.`
    };
  }

  // Major divergence (> 0.20)
  return {
    isMatch: false,
    status: 'CRITICAL_MISMATCH',
    rawDistance: rawDist,
    normalizedDistance: Number(normDist.toFixed(3)),
    similarityPercentage: similarity,
    badge: '❌ CRITICAL_MISMATCH',
    explanation: `Severe entity discrepancy between ${doc1Label} ("${primaryEntity}") and ${doc2Label} ("${secondaryEntity}"). Normalized distance: ${normDist.toFixed(2)} (${similarity}% similarity). Possible fraudulent submission or surrogate bidder.`
  };
}
