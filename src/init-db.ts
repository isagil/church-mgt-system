import pool from '../db.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  try {
    console.log('Initializing database...');

    // Read schema.sql
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual queries
    // Note: This is a simple split, might not handle complex SQL perfectly
    const queries = schema
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const query of queries) {
      await pool.query(query);
    }

    console.log('Tables created successfully.');

    // Check if admin exists
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if ((users as any[]).length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'Admin']
      );
      console.log('Default admin user created (admin / admin123).');
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Database initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDb();
