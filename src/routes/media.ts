import express from 'express';
import { supabase } from '../lib/supabase.js';
import { z } from 'zod';

const router = express.Router();

const mediaAssetSchema = z.object({
  title: z.string().min(1),
  file_url: z.string().url(),
  file_type: z.enum(['Image', 'Video', 'Document']),
  category: z.string().min(1),
});

// Get all media assets
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching media assets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single media asset
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('media_assets').select('*').eq('id', id).single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Media asset not found' });
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching media asset:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new media asset
router.post('/', async (req, res) => {
  try {
    const data = mediaAssetSchema.parse(req.body);
    const uploaded_by = 1; // You might want to get this from req.user.id
    
    const { data: newAsset, error } = await supabase.from('media_assets').insert({
      ...data,
      uploaded_by,
      created_at: new Date().toISOString()
    }).select().single();
    
    if (error) throw error;
    res.status(201).json(newAsset);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error adding media asset:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a media asset
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = mediaAssetSchema.parse(req.body);
    
    const { data: updated, error } = await supabase.from('media_assets').update(data).eq('id', id).select().single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Media asset not found' });
      throw error;
    }
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating media asset:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a media asset
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('media_assets').delete().eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Media asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting media asset:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
