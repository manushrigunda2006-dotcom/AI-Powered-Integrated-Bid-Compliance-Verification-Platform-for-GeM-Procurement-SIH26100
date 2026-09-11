/**
 * Indian Currency Normalization Utility
 * Handles Indian numbering system (Lakhs, Crores, ₹ commas) to deterministic float values.
 */

export function parseIndianCurrency(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') return isNaN(input) ? 0 : input;

  const raw = String(input).trim().toUpperCase();
  if (!raw) return 0;

  // Clean currency symbols and spaces
  const cleaned = raw.replace(/[₹,Rs\.INR\s]/gi, '').trim();

  // 1. Check for "Cr" or "Crore" or "Crores"
  const croreMatch = raw.match(/([\d.]+)\s*(?:CR|CRORE|CRORES)/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]);
    return isNaN(val) ? 0 : Math.round(val * 10000000);
  }

  // 2. Check for "Lakh" or "Lakhs" or "Lac" or "Lacs"
  const lakhMatch = raw.match(/([\d.]+)\s*(?:LAKH|LAKHS|LAC|LACS)/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    return isNaN(val) ? 0 : Math.round(val * 100000);
  }

  // 3. Check for "Thousand" or "K"
  const thousandMatch = raw.match(/([\d.]+)\s*(?:THOUSAND|K)/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1]);
    return isNaN(val) ? 0 : Math.round(val * 1000);
  }

  // 4. Pure numeric with possible Indian comma formatting (e.g. 2,50,00,000)
  const numericString = raw.replace(/[^\d.]/g, '');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format float to Indian Currency string (e.g., ₹4.50 Crores, ₹75 Lakhs)
 */
export function formatIndianCurrency(amount: number): string {
  if (!amount || isNaN(amount)) return '₹0';

  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `₹${crores.toFixed(2).replace(/\.00$/, '')} Crores`;
  }
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(2).replace(/\.00$/, '')} Lakhs`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    return `₹${thousands.toFixed(2).replace(/\.00$/, '')} K`;
  }

  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format standard Indian comma notation: 12345678 -> 1,23,45,678
 */
export function formatIndianCommas(amount: number): string {
  if (isNaN(amount)) return '0';
  return amount.toLocaleString('en-IN');
}
