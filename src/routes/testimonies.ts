import express from 'express';
import { supabase } from '../lib/supabase.js';
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
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('testimonies')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching testimonies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single testimony
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('testimonies').select('*').eq('id', id).single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Testimony not found' });
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching testimony:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Submit a testimony (public)
router.post('/submit', async (req, res) => {
  try {
    const data = testimonySchema.parse(req.body);
    const { data: newTestimony, error } = await supabase.from('testimonies').insert({
      ...data,
      submitted_at: new Date().toISOString()
    }).select().single();
    
    if (error) throw error;
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = testimonySchema.parse(req.body);
    
    const { data: updated, error } = await supabase.from('testimonies').update(data).eq('id', id).select().single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Testimony not found' });
      throw error;
    }
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating testimony:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a testimony
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('testimonies').delete().eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Testimony deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimony:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update testimony status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = z.object({ status: z.enum(['Pending', 'Approved', 'Declined']) }).parse(req.body);
    const { id } = req.params;
    
    const { error } = await supabase.from('testimonies').update({ status }).eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Testimony not found' });
      throw error;
    }

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
