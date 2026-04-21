import dotenv from 'dotenv';
dotenv.config();

console.log('--- Supabase Keys Prefix Check ---');
const sbKeys = Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('SERVICE'));
for (const key of sbKeys) {
    const val = process.env[key];
    const display = val ? `${val.substring(0, 15)}... (len: ${val.length})` : 'EMPTY';
    console.log(`${key}: ${display}`);
}

if (!process.env.VITE_SUPABASE_URL) {
    console.log('ERROR: VITE_SUPABASE_URL is missing from process.env');
}
if (!process.env.VITE_SUPABASE_ANON_KEY) {
    console.log('ERROR: VITE_SUPABASE_ANON_KEY is missing from process.env');
}
if (!process.env.JWT_SECRET) {
    console.log('ERROR: JWT_SECRET is missing from process.env');
}
