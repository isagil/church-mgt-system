import express from 'express';
import { supabase } from '../lib/supabase.js';
import { z } from 'zod';

const router = express.Router();

const memberSchema = z.object({
  full_name: z.string().min(3),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10).optional().nullable(),
});

// Get all members with optional search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from('members').select('*');

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('join_date', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single member
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Member not found' });
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new member
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone } = memberSchema.parse(req.body);
    const { data: newMember, error } = await supabase.from('members').insert({
      full_name,
      email: email || null,
      phone: phone || null,
      join_date: new Date().toISOString()
    }).select().single();
    
    if (error) throw error;
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone } = memberSchema.parse(req.body);
    
    const { data: updated, error } = await supabase.from('members').update({
      full_name,
      email: email || null,
      phone: phone || null
    }).eq('id', id).select().single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Member not found' });
      throw error;
    }
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('members').delete().eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
