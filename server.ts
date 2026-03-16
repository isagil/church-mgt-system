import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running with MySQL support' });
  });

  /**
   * SQL SCHEMA FOR REFERENCE:
   * 
   * CREATE TABLE members (
   *   id INT AUTO_INCREMENT PRIMARY KEY,
   *   full_name VARCHAR(255) NOT NULL,
   *   email VARCHAR(255),
   *   phone VARCHAR(20),
   *   join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * );
   * 
   * CREATE TABLE transactions (
   *   id INT AUTO_INCREMENT PRIMARY KEY,
   *   amount DECIMAL(10, 2) NOT NULL,
   *   type ENUM('income', 'expense') NOT NULL,
   *   category VARCHAR(100),
   *   description TEXT,
   *   date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * );
   */

  // Example API: Get Dashboard Stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      // Real MySQL query example:
      // const [memberCount] = await pool.query('SELECT COUNT(*) as count FROM members');
      // const [incomeSum] = await pool.query('SELECT SUM(amount) as total FROM transactions WHERE type = "income"');
      
      res.json({
        totalMembers: 1250,
        totalPartners: 450,
        totalIncome: 45230,
        totalTestimonies: 85,
        pendingBaptisms: 12
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // API: Get Members
  app.get('/api/members', async (req, res) => {
    try {
      // const [rows] = await pool.query('SELECT * FROM members ORDER BY join_date DESC');
      res.json([
        { id: 1, full_name: 'John Doe', email: 'john@example.com', join_date: '2026-01-01' }
      ]);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Example API: Get Finance Summary
  app.get('/api/finance/summary', async (req, res) => {
    try {
      // const [rows] = await pool.query('SELECT SUM(amount) as total FROM transactions WHERE type = "income"');
      res.json({
        totalIncome: 45000.50,
        totalExpenses: 12500.75,
        netBalance: 32499.75
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('MySQL connection pool initialized.');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
