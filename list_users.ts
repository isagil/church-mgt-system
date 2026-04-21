import { supabase } from './src/lib/supabase.js';

async function listUsers() {
  console.log('Fetching users from Supabase...');
  try {
    const { data, error } = await supabase.from('users').select('id, username, role, password_hash');
    
    if (error) {
      console.error('Error fetching users:', error.message);
      return;
    }
    
    if (data.length === 0) {
      console.log('No users found in the database. You need to seed the database.');
    } else {
      console.log('Users found:');
      data.forEach(user => {
        console.log(`- ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`);
        console.log(`  Hash Prefix: ${user.password_hash.substring(0, 10)}...`);
      });
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

listUsers();
