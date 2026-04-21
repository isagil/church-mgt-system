import express from 'express';
import { supabase } from '../lib/supabase.js';
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
router.get('/', async (req, res) => {
  try {
    const { category, status, member_id } = req.query;
    let query = supabase.from('partnerships').select('*, members(full_name)');

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (member_id) query = query.eq('member_id', parseInt(member_id as string));

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;

    const enriched = data.map((p: any) => ({
      ...p,
      member_name: p.members ? p.members.full_name : 'Unknown'
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single partnership
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: p, error } = await supabase.from('partnerships').select('*, members(full_name)').eq('id', id).single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Partnership not found' });
      throw error;
    }
    
    const formatted = {
      ...p,
      member_name: p.members ? p.members.full_name : 'Unknown'
    };
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new partnership
router.post('/', async (req, res) => {
  try {
    const data = partnershipSchema.parse(req.body);
    const { data: newP, error } = await supabase.from('partnerships').insert({
      ...data
    }).select().single();
    
    if (error) throw error;
    res.status(201).json(newP);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error adding partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a partnership
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = partnershipSchema.parse(req.body);
    
    const { data: updated, error } = await supabase.from('partnerships').update(data).eq('id', id).select().single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Partnership not found' });
      throw error;
    }
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a partnership
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('partnerships').delete().eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Partnership deleted successfully' });
  } catch (error) {
    console.error('Error deleting partnership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
