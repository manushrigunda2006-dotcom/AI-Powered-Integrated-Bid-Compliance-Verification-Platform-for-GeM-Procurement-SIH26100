import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch {
  // Ignore env read error
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://xyz-demo.supabase.co';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'your-supabase-anon-key';

console.log(`Connecting to Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding GeM Compliance Engine database on Supabase...');

  // 1. Insert Profile
  const { error: profileError } = await supabase.from('profiles').upsert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'ABCD',
      email: 'abcd@gmail.com',
      role: 'OFFICER',
      designation: '',
      department: 'Ministry of Commerce & Industry',
    },
  ]);
  if (profileError) console.warn('Profile seed note:', profileError.message);
  else console.log('✅ Profile seeded: ABCD');

  // 2. Insert Tender
  const { error: tenderError } = await supabase.from('tenders').upsert([
    {
      id: '11111111-1111-1111-1111-111111111111',
      tender_number: 'GEM/2026/B/892104',
      title: 'Procurement of High-End Enterprise Cloud Servers & Networking Hardware for National Data Centers',
      department: 'Ministry of Electronics and Information Technology (MeitY), National Informatics Centre (NIC)',
      description: 'Procurement of high-capacity server infrastructure and core switches for multi-region cloud deployment.',
      issue_date: '2026-08-20T10:00:00Z',
      closing_date: '2026-10-15T18:00:00Z',
      minimum_turnover: 30000000.0,
      minimum_experience_years: 5,
      required_gst_status: 'ACTIVE',
      required_blacklist_status: 'CLEARED',
      required_msme_status: 'VERIFIED',
      status: 'ACTIVE',
    },
  ]);
  if (tenderError) console.warn('Tender seed note:', tenderError.message);
  else console.log('✅ Tender GEM/2026/B/892104 seeded');

  // 3. Insert Tender Clauses (R001 - R006)
  const clauses = [
    {
      id: '33333333-3333-3333-3333-333333333001',
      tender_id: '11111111-1111-1111-1111-111111111111',
      clause_code: 'R001',
      title: 'Minimum Average Annual Turnover',
      description: 'The minimum average annual turnover of the bidder during the last 3 financial years must be at least ₹3.00 Crores, certified by a Chartered Accountant with valid UDIN.',
      category: 'FINANCIAL',
      mandatory: true,
      threshold: '₹3.00 Crores average over last 3 financial years',
      weight: 25,
      display_order: 1,
    },
    {
      id: '33333333-3333-3333-3333-333333333002',
      tender_id: '11111111-1111-1111-1111-111111111111',
      clause_code: 'R002',
      title: 'Past Operational Experience',
      description: 'Bidder must possess a minimum of 5 years continuous operational experience executing enterprise IT hardware / cloud infrastructure contracts for Govt/PSU/Scheduled Commercial entities.',
      category: 'EXPERIENCE',
      mandatory: true,
      threshold: 'Minimum 5 Years Active Experience',
      weight: 20,
      display_order: 2,
    },
    {
      id: '33333333-3333-3333-3333-333333333003',
      tender_id: '11111111-1111-1111-1111-111111111111',
      clause_code: 'R003',
      title: 'Statutory GST Registration Validity',
      description: 'Bidder must hold an Active Form GST REG-06 registration certificate valid on the date of bid submission with no record of cancellation or non-filing suspension.',
      category: 'STATUTORY',
      mandatory: true,
      threshold: 'Active GSTIN through Bid Closing',
      weight: 20,
      display_order: 3,
    },
    {
      id: '33333333-3333-3333-3333-333333333004',
      tender_id: '11111111-1111-1111-1111-111111111111',
      clause_code: 'R004',
      title: 'Non-Debarment / Anti-Blacklisting Affidavit',
      description: 'Bidder must furnish a notarized affidavit affirming non-debarment and verify clean standing on the Central Public Procurement Portal (CPPP) National Debarment Database.',
      category: 'STATUTORY',
      mandatory: true,
      threshold: 'Zero Debarment / CPPP Clear',
      weight: 15,
      display_order: 4,
    },
    {
      id: '33333333-3333-3333-3333-333333333005',
      tender_id: '11111111-1111-1111-1111-111111111111',
      clause_code: 'R005',
      title: 'OEM Authorization Form (MAF)',
      description: 'Bidder must submit a verifiable Manufacturer Authorization Form from authorized OEM specifically tied to this GeM Tender. Legal entity name must match bidder documentation.',
      category: 'OEM',
      mandatory: true,
      threshold: 'OEM Authorized Partner Certification',
      weight: 15,
      display_order: 5,
    },
    {
      id: '33333333-3333-3333-3333-333333333006',
      tender_id: '11111111-1111-1111-1111-111111111111',
      clause_code: 'R006',
      title: 'MSME / Udyam Make-in-India Preference',
      description: 'Valid Udyam Registration Certificate for MSE purchase preference and tender fee / EMD exemption under Public Procurement Policy (PPP-MSE).',
      category: 'TECHNICAL',
      mandatory: false,
      threshold: 'Valid Udyam/MSME registration where applicable',
      weight: 5,
      display_order: 6,
    },
  ];
  const { error: clauseError } = await supabase.from('tender_clauses').upsert(clauses);
  if (clauseError) console.warn('Clauses seed note:', clauseError.message);
  else console.log('✅ 6 Tender Clauses R001-R006 seeded');

  // 4. Insert Bidders
  const bidders = [
    {
      id: '22222222-2222-2222-2222-222222222221',
      tender_id: '11111111-1111-1111-1111-111111111111',
      bidder_code: 'BIDDER-01',
      company_name: 'BCDE Technologies Private Limited',
      email: 'compliance@bcdetech.in',
      gstin: '07AAACB1234F1Z8',
      pan: 'AAACB1234F',
      udyam_number: 'UDYAM-DL-01-0089123',
      status: 'ELIGIBLE',
      compliance_score: 100,
      risk_level: 'LOW',
      evaluation_gate: 'FULL_PASS',
      mandatory_breaches: 0,
      clarification_flags: 0,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      tender_id: '11111111-1111-1111-1111-111111111111',
      bidder_code: 'BIDDER-02',
      company_name: 'CDEF Solutions Private Limited',
      email: 'tenders@cdefsolutions.co.in',
      gstin: '27AABC5678K1ZQ',
      pan: 'AABCA5678K',
      udyam_number: 'UDYAM-MH-02-0045612',
      status: 'REVIEW_REQUIRED',
      compliance_score: 85,
      risk_level: 'MEDIUM',
      evaluation_gate: 'REVIEW_REQUIRED',
      mandatory_breaches: 0,
      clarification_flags: 1,
    },
    {
      id: '22222222-2222-2222-2222-222222222223',
      tender_id: '11111111-1111-1111-1111-111111111111',
      bidder_code: 'BIDDER-03',
      company_name: 'DEFG Systems Limited',
      email: 'contact@defgsystems.org',
      gstin: '33AAACD9999L1ZM',
      pan: 'AAACD9999L',
      udyam_number: 'UDYAM-TN-03-0099881',
      status: 'DISQUALIFIED',
      compliance_score: 2,
      risk_level: 'HIGH',
      evaluation_gate: 'FATAL_NON_COMPLIANCE',
      mandatory_breaches: 7,
      clarification_flags: 1,
    },
  ];
  const { error: bidderError } = await supabase.from('bidders').upsert(bidders);
  if (bidderError) console.warn('Bidders seed note:', bidderError.message);
  else console.log('✅ Bidders 1, 2, and 3 seeded');

  console.log('🎉 Supabase database seeding complete!');
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
