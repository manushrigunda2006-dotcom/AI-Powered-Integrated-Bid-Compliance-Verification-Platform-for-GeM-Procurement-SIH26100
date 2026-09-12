/**
 * ID Mapper Utility
 * Maps human-readable identifiers/slugs to actual Supabase database UUIDs
 * and normalizes bidder / tender lookups for all 20 bidders.
 */

export const TENDER_ID_MAP: Record<string, string> = {
  'tender-gem-2026-cloud': '11111111-1111-1111-1111-111111111111',
  'TENDER-ABCD-001': '11111111-1111-1111-1111-111111111111',
  'GEM/2026/B/892104': '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111': '11111111-1111-1111-1111-111111111111',
};

const BIDDER_NAMES = [
  { num: '01', code: 'ABCD', name: 'ABCD Technologies' },
  { num: '02', code: 'BCDE', name: 'BCDE Solutions' },
  { num: '03', code: 'CDEF', name: 'CDEF Industries' },
  { num: '04', code: 'DEFG', name: 'DEFG Systems' },
  { num: '05', code: 'EFGH', name: 'EFGH Enterprises' },
  { num: '06', code: 'FGHI', name: 'FGHI Digital' },
  { num: '07', code: 'GHIJ', name: 'GHIJ Innovations' },
  { num: '08', code: 'HIJK', name: 'HIJK Solutions' },
  { num: '09', code: 'IJKL', name: 'IJKL Technologies' },
  { num: '10', code: 'JKLM', name: 'JKLM Systems' },
  { num: '11', code: 'KLMN', name: 'KLMN Enterprises' },
  { num: '12', code: 'LMNO', name: 'LMNO Technologies' },
  { num: '13', code: 'MNOP', name: 'MNOP Solutions' },
  { num: '14', code: 'NOPQ', name: 'NOPQ Industries' },
  { num: '15', code: 'OPQR', name: 'OPQR Systems' },
  { num: '16', code: 'PQRS', name: 'PQRS Innovations' },
  { num: '17', code: 'QRST', name: 'QRST Enterprises' },
  { num: '18', code: 'RSTU', name: 'RSTU Technologies' },
  { num: '19', code: 'STUV', name: 'STUV Solutions' },
  { num: '20', code: 'TUVW', name: 'TUVW Systems' },
];

export const BIDDER_ID_MAP: Record<string, string> = {};

// Build mapping for all 20 bidders
for (let i = 1; i <= 20; i++) {
  const padded = i < 10 ? `0${i}` : `${i}`;
  const unpadded = `${i}`;
  const item = BIDDER_NAMES[i - 1];
  const uuid = `22222222-2222-2222-2222-2222222222${padded}`;

  // Bidder 1-3 backwards-compatible UUID aliases
  if (i === 1) BIDDER_ID_MAP['22222222-2222-2222-2222-222222222221'] = '22222222-2222-2222-2222-222222222201';
  if (i === 2) BIDDER_ID_MAP['22222222-2222-2222-2222-222222222222'] = '22222222-2222-2222-2222-222222222202';
  if (i === 3) BIDDER_ID_MAP['22222222-2222-2222-2222-222222222223'] = '22222222-2222-2222-2222-222222222203';

  BIDDER_ID_MAP[`bidder-${padded}`] = uuid;
  BIDDER_ID_MAP[`bidder-${unpadded}`] = uuid;
  BIDDER_ID_MAP[`BIDDER-${padded}`] = uuid;
  BIDDER_ID_MAP[`BIDDER-${unpadded}`] = uuid;
  BIDDER_ID_MAP[`BIDDER-${item.code}-${padded}`] = uuid;
  BIDDER_ID_MAP[`bidder-${item.code.toLowerCase()}-${padded}`] = uuid;
  BIDDER_ID_MAP[uuid] = uuid;
}

export function resolveTenderId(id: string): string {
  if (!id) return '11111111-1111-1111-1111-111111111111';
  return TENDER_ID_MAP[id] || id;
}

export function resolveBidderId(id: string): string {
  if (!id) return '22222222-2222-2222-2222-222222222201';
  const clean = id.trim();
  return BIDDER_ID_MAP[clean] || BIDDER_ID_MAP[clean.toLowerCase()] || clean;
}
