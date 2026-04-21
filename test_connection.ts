import { supabase } from './src/lib/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  console.log('Testing Supabase connection...');
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  console.log('URL:', url ? 'Defined' : 'MISSING');
  console.log('Key:', key ? 'Defined' : 'MISSING');
  
  if (!url || !key) {
    console.error('ERROR: Supabase credentials are missing!');
    process.exit(1);
    return;
  }

  try {
    // Attempt to select from users table
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection failed (Supabase error):', error.message);
      process.exit(1);
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Database is accessible.');
    process.exit(0);
  } catch (err: any) {
    console.error('Unexpected error during connection test:', err.message || err);
    process.exit(1);
  }
}

testConnection();
