import express from 'express';
import { z } from 'zod';
import { websiteSettings, partnerships, testimonies, baptismRequests, members } from '../mockData.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Validation schema for website settings
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
    res.json(websiteSettings);
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/website/settings - Update website settings (Admin only)
router.put('/settings', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const validatedData = websiteSettingsSchema.parse(req.body);
    
    Object.assign(websiteSettings, {
      ...validatedData,
      updated_at: new Date().toISOString()
    });

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
router.get('/submissions', authenticateToken, async (req, res) => {
  try {
    const recentPartnerships = partnerships.map(p => {
      const member = members.find(m => m.id === p.member_id);
      return {
        type: 'Partnership',
        name: member ? member.full_name : 'Unknown',
        date: p.created_at,
        status: p.status
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    const recentTestimonies = testimonies.map(t => ({
      type: 'Testimony',
      name: t.full_name,
      date: t.submitted_at,
      status: t.status
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    const recentBaptisms = baptismRequests.map(b => ({
      type: 'Baptism',
      name: b.full_name,
      date: b.submitted_at,
      status: b.status
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

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
