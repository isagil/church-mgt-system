import express from 'express';
import { partnerships, members, getNextId } from '../mockData.js';
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
    
    let filtered = partnerships.map(p => {
      const member = members.find(m => m.id === p.member_id);
      return { ...p, member_name: member ? member.full_name : 'Unknown' };
    });

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (member_id) {
      filtered = filtered.filter(p => p.member_id === parseInt(member_id as string));
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single partnership
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const partnership = partnerships.find(p => p.id === parseInt(id as string));
    if (!partnership) {
      return res.status(404).json({ error: 'Partnership not found' });
    }
    const member = members.find(m => m.id === partnership.member_id);
    res.json({ ...partnership, member_name: member ? member.full_name : 'Unknown' });
  } catch (error) {
    console.error('Error fetching partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new partnership
router.post('/', authenticateToken, authorizeRole(['Admin', 'Finance']), async (req, res) => {
  try {
    const data = partnershipSchema.parse(req.body);
    const newPartnership = {
      id: getNextId('partnerships'),
      ...data,
      created_at: new Date().toISOString()
    };
    partnerships.push(newPartnership);
    res.status(201).json(newPartnership);
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
    const index = partnerships.findIndex(p => p.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Partnership not found' });
    }
    partnerships[index] = {
      ...partnerships[index],
      ...data
    };
    res.json(partnerships[index]);
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
    const index = partnerships.findIndex(p => p.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Partnership not found' });
    }
    partnerships.splice(index, 1);
    res.json({ message: 'Partnership deleted successfully' });
  } catch (error) {
    console.error('Error deleting partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
