import express from 'express';
import pool from '../../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

const baptismRequestSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['Pending', 'Approved', 'Completed']).default('Pending'),
});

// Get all baptism requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM baptism_requests ORDER BY submitted_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching baptism requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single baptism request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM baptism_requests WHERE id = ?', [id]);
    const request = (rows as any[])[0];
    if (!request) {
      return res.status(404).json({ error: 'Baptism request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching baptism request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Submit a baptism request (public)
router.post('/submit', async (req, res) => {
  try {
    const data = baptismRequestSchema.parse(req.body);
    const [result] = await pool.query(
      'INSERT INTO baptism_requests (full_name, email, phone, preferred_date) VALUES (?, ?, ?, ?)',
      [data.full_name, data.email, data.phone, data.preferred_date]
    );
    res.status(201).json({ id: (result as any).insertId, ...data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error submitting baptism request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a baptism request
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Pastor']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = baptismRequestSchema.parse(req.body);
    await pool.query(
      'UPDATE baptism_requests SET full_name = ?, email = ?, phone = ?, preferred_date = ?, status = ? WHERE id = ?',
      [data.full_name, data.email, data.phone, data.preferred_date, data.status, id]
    );
    res.json({ id, ...data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating baptism request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a baptism request
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM baptism_requests WHERE id = ?', [id]);
    res.json({ message: 'Baptism request deleted successfully' });
  } catch (error) {
    console.error('Error deleting baptism request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update baptism request status
router.patch('/:id/status', authenticateToken, authorizeRole(['Admin', 'Pastor']), async (req, res) => {
  try {
    const { status } = z.object({ status: z.enum(['Pending', 'Approved', 'Completed']) }).parse(req.body);
    const { id } = req.params;
    await pool.query('UPDATE baptism_requests SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Baptism request status updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating baptism request status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
