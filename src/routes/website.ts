import express from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

const websiteSettingsSchema = z.object({
  hero_title: z.string().min(1).max(255),
  hero_subtitle: z.string().max(1000).optional(),
  primary_action_text: z.string().max(50).optional(),
  secondary_action_text: z.string().max(50).optional(),
  notification_email: z.string().email().optional(),
  meta_title: z.string().max(255).optional(),
  google_analytics_id: z.string().max(50).optional(),
  forms_enabled: z.record(z.string(), z.boolean()).optional(),
});

// GET /api/website/settings - Get current website settings
router.get('/settings', async (req, res) => {
  try {
    const { data, error } = await supabase.from('website_settings').select('*').single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || {});
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/website/settings - Update website settings (Admin only)
router.put('/settings', async (req, res) => {
  try {
    const validatedData = websiteSettingsSchema.parse(req.body);
    
    // Check if settings exists
    const { data: existing } = await supabase.from('website_settings').select('id').single();

    let result;
    if (existing) {
      result = await supabase.from('website_settings').update({
        ...validatedData,
        updated_at: new Date().toISOString()
      }).eq('id', existing.id);
    } else {
      result = await supabase.from('website_settings').insert({
        ...validatedData,
        updated_at: new Date().toISOString()
      });
    }

    if (result.error) throw result.error;
    res.json({ message: 'Website settings updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Error updating website settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/website/submissions - Get recent submissions for the website dashboard
router.get('/submissions', async (req, res) => {
  try {
    const [partnershipsRes, testimoniesRes, baptismsRes] = await Promise.all([
      supabase.from('partnerships').select('*, members(full_name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('testimonies').select('*').order('submitted_at', { ascending: false }).limit(5),
      supabase.from('baptism_requests').select('*').order('submitted_at', { ascending: false }).limit(5)
    ]);

    const recentPartnerships = (partnershipsRes.data || []).map((p: any) => ({
      type: 'Partnership',
      name: p.members ? p.members.full_name : 'Unknown',
      date: p.created_at,
      status: p.status
    }));

    const recentTestimonies = (testimoniesRes.data || []).map(t => ({
      type: 'Testimony',
      name: t.full_name,
      date: t.submitted_at,
      status: t.status
    }));

    const recentBaptisms = (baptismsRes.data || []).map(b => ({
      type: 'Baptism',
      name: b.full_name,
      date: b.submitted_at,
      status: b.status
    }));

    const allSubmissions = [...recentPartnerships, ...recentTestimonies, ...recentBaptisms]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    res.json(allSubmissions);
  } catch (error) {
    console.error('Error fetching website submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
