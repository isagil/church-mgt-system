import { supabase } from './src/lib/supabase.js';

async function checkTables() {
  console.log('Checking database tables...');
  
  const tables = [
    'baptism_requests', 
    'finance_transactions', 
    'media_assets', 
    'members', 
    'partnerships', 
    'testimonies', 
    'users', 
    'website_settings'
  ];

  for (const table of tables) {
    console.log(`Checking table: ${table}...`);
    const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error(`- Error for ${table}:`, error.message);
    } else {
      console.log(`- Table ${table} is accessible (Count: ${data === null ? 0 : data})`);
    }
  }
}

checkTables();
