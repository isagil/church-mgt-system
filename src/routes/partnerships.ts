import express from 'express';
import pool from '../../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

const partnershipSchema = z.object({
  member_id: z.number(),
  category: z.string().min(1),
  commitment_amount: z.number().positive(),
  frequency: z.enum(['Monthly', 'Weekly', 'One-time']),
  status: z.enum(['Active', 'Pending']).default('Pending'),
});

// Get all partnerships with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, status, member_id } = req.query;
    let query = `
      SELECT p.*, m.full_name as member_name 
      FROM partnerships p 
      JOIN members m ON p.member_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    if (member_id) {
      query += ' AND p.member_id = ?';
      params.push(member_id);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single partnership
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, m.full_name as member_name 
      FROM partnerships p 
      JOIN members m ON p.member_id = m.id
      WHERE p.id = ?
    `, [id]);
    const partnership = (rows as any[])[0];
    if (!partnership) {
      return res.status(404).json({ error: 'Partnership not found' });
    }
    res.json(partnership);
  } catch (error) {
    console.error('Error fetching partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new partnership
router.post('/', authenticateToken, authorizeRole(['Admin', 'Finance']), async (req, res) => {
  try {
    const data = partnershipSchema.parse(req.body);
    const [result] = await pool.query(
      'INSERT INTO partnerships (member_id, category, commitment_amount, frequency, status) VALUES (?, ?, ?, ?, ?)',
      [data.member_id, data.category, data.commitment_amount, data.frequency, data.status]
    );
    res.status(201).json({ id: (result as any).insertId, ...data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error adding partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a partnership
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Finance']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = partnershipSchema.parse(req.body);
    await pool.query(
      'UPDATE partnerships SET member_id = ?, category = ?, commitment_amount = ?, frequency = ?, status = ? WHERE id = ?',
      [data.member_id, data.category, data.commitment_amount, data.frequency, data.status, id]
    );
    res.json({ id, ...data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a partnership
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM partnerships WHERE id = ?', [id]);
    res.json({ message: 'Partnership deleted successfully' });
  } catch (error) {
    console.error('Error deleting partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
