import express from 'express';
import { baptismRequests, getNextId } from '../mockData.js';
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
    const sortedRequests = [...baptismRequests].sort((a, b) => 
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
    res.json(sortedRequests);
  } catch (error) {
    console.error('Error fetching baptism requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single baptism request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const request = baptismRequests.find(r => r.id === parseInt(id as string));
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
    const newRequest = {
      id: getNextId('baptismRequests'),
      ...data,
      location: 'Main Sanctuary', // Default location
      submitted_at: new Date().toISOString()
    };
    baptismRequests.push(newRequest);
    res.status(201).json(newRequest);
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
    const index = baptismRequests.findIndex(r => r.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Baptism request not found' });
    }
    baptismRequests[index] = {
      ...baptismRequests[index],
      ...data
    };
    res.json(baptismRequests[index]);
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
    const index = baptismRequests.findIndex(r => r.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Baptism request not found' });
    }
    baptismRequests.splice(index, 1);
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
    const index = baptismRequests.findIndex(r => r.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Baptism request not found' });
    }
    baptismRequests[index].status = status;
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
