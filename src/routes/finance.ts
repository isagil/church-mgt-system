import express from 'express';
import pool from '../../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['Tithe', 'Offering', 'Expenditure', 'Partnership']),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(['Completed', 'Pending', 'Cancelled']).default('Pending'),
});

// Get all transactions with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get finance summary stats
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const [incomeRows] = await pool.query('SELECT SUM(amount) as total FROM transactions WHERE type IN ("Tithe", "Offering", "Partnership") AND status = "Completed"');
    const [expenseRows] = await pool.query('SELECT SUM(amount) as total FROM transactions WHERE type = "Expenditure" AND status = "Completed"');
    
    const totalIncome = (incomeRows as any[])[0].total || 0;
    const totalExpenses = (expenseRows as any[])[0].total || 0;
    
    res.json({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses
    });
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single transaction
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    const transaction = (rows as any[])[0];
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new transaction
router.post('/', authenticateToken, authorizeRole(['Admin', 'Finance']), async (req, res) => {
  try {
    const { amount, type, category, description, status } = transactionSchema.parse(req.body);
    const [result] = await pool.query(
      'INSERT INTO transactions (amount, type, category, description, status) VALUES (?, ?, ?, ?, ?)',
      [amount, type, category, description, status]
    );
    const insertId = (result as any).insertId;
    res.status(201).json({ id: insertId, amount, type, category, description, status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a transaction
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Finance']), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, description, status } = transactionSchema.parse(req.body);
    await pool.query(
      'UPDATE transactions SET amount = ?, type = ?, category = ?, description = ?, status = ? WHERE id = ?',
      [amount, type, category, description, status, id]
    );
    res.json({ id, amount, type, category, description, status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a transaction
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
