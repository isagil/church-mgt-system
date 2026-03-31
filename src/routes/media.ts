import express from 'express';
import { mediaAssets, getNextId } from '../mockData.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

const mediaAssetSchema = z.object({
  title: z.string().min(1),
  file_url: z.string().url(),
  file_type: z.enum(['Image', 'Video', 'Document']),
  category: z.string().min(1),
});

// Get all media assets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sortedAssets = [...mediaAssets].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    res.json(sortedAssets);
  } catch (error) {
    console.error('Error fetching media assets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single media asset
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const asset = mediaAssets.find(a => a.id === parseInt(id as string));
    if (!asset) {
      return res.status(404).json({ error: 'Media asset not found' });
    }
    res.json(asset);
  } catch (error) {
    console.error('Error fetching media asset:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new media asset
router.post('/', authenticateToken, authorizeRole(['Admin', 'Media']), async (req, res) => {
  try {
    const data = mediaAssetSchema.parse(req.body);
    const uploaded_by = (req as any).user.id;
    const newAsset = {
      id: getNextId('mediaAssets'),
      ...data,
      uploaded_by,
      created_at: new Date().toISOString()
    };
    mediaAssets.push(newAsset);
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
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Media']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = mediaAssetSchema.parse(req.body);
    const index = mediaAssets.findIndex(a => a.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Media asset not found' });
    }
    mediaAssets[index] = {
      ...mediaAssets[index],
      ...data
    };
    res.json(mediaAssets[index]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating media asset:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a media asset
router.delete('/:id', authenticateToken, authorizeRole(['Admin', 'Media']), async (req, res) => {
  try {
    const { id } = req.params;
    const index = mediaAssets.findIndex(a => a.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'Media asset not found' });
    }
    mediaAssets.splice(index, 1);
    res.json({ message: 'Media asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting media asset:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
