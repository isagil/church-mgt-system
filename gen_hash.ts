import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'pmccsam1';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('HASH:', hash);
}

generateHash();
