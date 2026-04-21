import express from 'express';
import { supabase } from '../lib/supabase.js';
import { z } from 'zod';

const router = express.Router();

const baptismRequestSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['Pending', 'Approved', 'Completed', 'Declined']).default('Pending'),
});

// Get all baptism requests
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('baptism_requests')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching baptism requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single baptism request
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('baptism_requests').select('*').eq('id', id).single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Baptism request not found' });
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching baptism request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Submit a baptism request (public)
router.post('/submit', async (req, res) => {
  try {
    const data = baptismRequestSchema.parse(req.body);
    const { data: newRequest, error } = await supabase.from('baptism_requests').insert({
      ...data,
      location: 'Main Sanctuary', // Default location
      submitted_at: new Date().toISOString()
    }).select().single();
    
    if (error) throw error;
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = baptismRequestSchema.parse(req.body);
    
    const { data: updated, error } = await supabase.from('baptism_requests').update(data).eq('id', id).select().single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Baptism request not found' });
      throw error;
    }
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating baptism request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a baptism request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('baptism_requests').delete().eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Baptism request deleted successfully' });
  } catch (error) {
    console.error('Error deleting baptism request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update baptism request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = z.object({ status: z.enum(['Pending', 'Approved', 'Completed', 'Declined']) }).parse(req.body);
    const { id } = req.params;
    
    const { error } = await supabase.from('baptism_requests').update({ status }).eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Baptism request not found' });
      throw error;
    }

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
