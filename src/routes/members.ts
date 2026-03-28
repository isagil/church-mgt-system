import express from 'express';
import pool from '../../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

const memberSchema = z.object({
  full_name: z.string().min(3),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10).optional().nullable(),
});

// Get all members with optional search
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM members';
    const params: any[] = [];

    if (search) {
      query += ' WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY join_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single member
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    const member = (rows as any[])[0];
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new member
router.post('/', authenticateToken, authorizeRole(['Admin', 'Pastor']), async (req, res) => {
  try {
    const { full_name, email, phone } = memberSchema.parse(req.body);
    const [result] = await pool.query(
      'INSERT INTO members (full_name, email, phone) VALUES (?, ?, ?)',
      [full_name, email, phone]
    );
    const insertId = (result as any).insertId;
    res.status(201).json({ id: insertId, full_name, email, phone });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a member
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Pastor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone } = memberSchema.parse(req.body);
    await pool.query(
      'UPDATE members SET full_name = ?, email = ?, phone = ? WHERE id = ?',
      [full_name, email, phone, id]
    );
    res.json({ id, full_name, email, phone });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a member
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM members WHERE id = ?', [id]);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
