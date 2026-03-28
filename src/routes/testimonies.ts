import express from 'express';
import pool from '../../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

const testimonySchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  title: z.string().min(1),
  content: z.string().min(1),
  media_urls: z.array(z.string().url()).optional(),
  status: z.enum(['Pending', 'Approved', 'Declined']).default('Pending'),
});

// Get all testimonies
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM testimonies ORDER BY submitted_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching testimonies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single testimony
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM testimonies WHERE id = ?', [id]);
    const testimony = (rows as any[])[0];
    if (!testimony) {
      return res.status(404).json({ error: 'Testimony not found' });
    }
    res.json(testimony);
  } catch (error) {
    console.error('Error fetching testimony:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Submit a testimony (public)
router.post('/submit', async (req, res) => {
  try {
    const data = testimonySchema.parse(req.body);
    const [result] = await pool.query(
      'INSERT INTO testimonies (full_name, email, title, content, media_urls) VALUES (?, ?, ?, ?, ?)',
      [data.full_name, data.email, data.title, data.content, JSON.stringify(data.media_urls || [])]
    );
    res.status(201).json({ id: (result as any).insertId, ...data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error submitting testimony:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a testimony
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Pastor']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = testimonySchema.parse(req.body);
    await pool.query(
      'UPDATE testimonies SET full_name = ?, email = ?, title = ?, content = ?, media_urls = ?, status = ? WHERE id = ?',
      [data.full_name, data.email, data.title, data.content, JSON.stringify(data.media_urls || []), data.status, id]
    );
    res.json({ id, ...data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating testimony:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a testimony
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM testimonies WHERE id = ?', [id]);
    res.json({ message: 'Testimony deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimony:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update testimony status
router.patch('/:id/status', authenticateToken, authorizeRole(['Admin', 'Pastor']), async (req, res) => {
  try {
    const { status } = z.object({ status: z.enum(['Pending', 'Approved', 'Declined']) }).parse(req.body);
    const { id } = req.params;
    await pool.query('UPDATE testimonies SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Testimony status updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating testimony status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
