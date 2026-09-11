import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local
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
  // ignore
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyz-demo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('🔍 Checking Supabase table availability for:', supabaseUrl);
  const tables = ['profiles', 'tenders', 'bidders', 'tender_clauses', 'bidder_documents', 'compliance_results', 'audit_logs'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        console.log(`❌ Table '${table}': NOT FOUND (${error.message})`);
      } else {
        console.log(`✅ Table '${table}': ONLINE (${data.length} records checked)`);
      }
    } catch (err: any) {
      console.log(`❌ Table '${table}': ERROR (${err.message})`);
    }
  }
}

verifyTables();
