import express from 'express';
import { testimonies, getNextId } from '../mockData.js';
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
    const sortedTestimonies = [...testimonies].sort((a, b) => 
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
    res.json(sortedTestimonies);
  } catch (error) {
    console.error('Error fetching testimonies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single testimony
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const testimony = testimonies.find(t => t.id === parseInt(id as string));
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
    const newTestimony = {
      id: getNextId('testimonies'),
      ...data,
      submitted_at: new Date().toISOString()
    };
    testimonies.push(newTestimony);
    res.status(201).json(newTestimony);
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
    const index = testimonies.findIndex(t => t.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Testimony not found' });
    }
    testimonies[index] = {
      ...testimonies[index],
      ...data
    };
    res.json(testimonies[index]);
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
    const index = testimonies.findIndex(t => t.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Testimony not found' });
    }
    testimonies.splice(index, 1);
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
    const index = testimonies.findIndex(t => t.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Testimony not found' });
    }
    testimonies[index].status = status;
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
