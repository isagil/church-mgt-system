import { supabase } from './src/lib/supabase.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  const username = 'admin';
  const password = 'pmccsam1';
  
  console.log(`Generating hash for password: ${password}...`);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log(`Seeding user: ${username}...`);
  
  const { data, error } = await supabase.from('users').insert([{
    username: username,
    password_hash: hash,
    role: 'Admin',
    permissions: {
      members: { view: true, edit: true },
      finance: { view: true, edit: true },
      testimonies: { view: true, edit: true },
      media: { view: true, edit: true },
      website: { view: true, edit: true },
      users: { view: true, edit: true }
    }
  }]).select();
  
  if (error) {
    console.error('Error seeding admin:', error.message);
  } else {
    console.log('Successfully seeded admin user!', data);
  }
}

seedAdmin();
