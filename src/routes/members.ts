import express from 'express';
import { members, getNextId } from '../mockData.js';
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
    let filteredMembers = [...members];

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredMembers = filteredMembers.filter(m => 
        m.full_name.toLowerCase().includes(searchTerm) || 
        (m.email && m.email.toLowerCase().includes(searchTerm)) || 
        (m.phone && m.phone.includes(searchTerm))
      );
    }

    filteredMembers.sort((a, b) => new Date(b.join_date).getTime() - new Date(a.join_date).getTime());
    res.json(filteredMembers);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single member
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const member = members.find(m => m.id === parseInt(id as string));
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
    const newMember = {
      id: getNextId('members'),
      full_name,
      email: email || null,
      phone: phone || null,
      join_date: new Date().toISOString()
    };
    members.push(newMember);
    res.status(201).json(newMember);
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
    const index = members.findIndex(m => m.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }
    members[index] = {
      ...members[index],
      full_name,
      email: email || null,
      phone: phone || null
    };
    res.json(members[index]);
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
    const index = members.findIndex(m => m.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }
    members.splice(index, 1);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
