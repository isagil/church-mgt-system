import express from 'express';
import multer from 'multer';
import { supabase } from '../lib/supabase.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/storage/upload - Upload to Supabase Storage
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { bucket = 'media' } = req.body;
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
       console.error('Supabase storage error:', error);
       return res.status(500).json({ error: error.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    res.json({
      url: publicUrl,
      path: filePath,
      name: fileName
    });
  } catch (error) {
    console.error('Upload catch error:', error);
    res.status(500).json({ error: 'Internal Server Error during upload' });
  }
});

export default router;
