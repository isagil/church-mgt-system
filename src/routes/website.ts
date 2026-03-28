import express from 'express';
import { z } from 'zod';
import pool from '../../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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
    const [rows] = await pool.query('SELECT * FROM website_settings LIMIT 1', []) as [any[], any];
    
    if (rows.length === 0) {
      // Return default settings if none exist
      return res.json({
        hero_title: 'Welcome to Prayer Miracle Church of Christ',
        hero_subtitle: 'Experience the power of prayer and the miracle of faith.',
        primary_action_text: 'Join Us Online',
        secondary_action_text: 'Request Prayer',
        notification_email: 'web-alerts@pmcc.org',
        meta_title: 'PMCC - Prayer Miracle Church of Christ',
        google_analytics_id: '',
        forms_enabled: {
          partnership: true,
          testimony: true,
          baptism: true
        }
      });
    }

    const settings = rows[0];
    // Parse JSON fields
    if (settings.forms_enabled && typeof settings.forms_enabled === 'string') {
      settings.forms_enabled = JSON.parse(settings.forms_enabled);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/website/settings - Update website settings (Admin only)
router.put('/settings', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const validatedData = websiteSettingsSchema.parse(req.body);
    
    // Check if settings already exist
    const [existing] = await pool.query('SELECT id FROM website_settings LIMIT 1', []) as [any[], any];
    
    const formsEnabledJson = JSON.stringify(validatedData.forms_enabled || {});

    if (existing.length > 0) {
      // Update existing
      await pool.query<ResultSetHeader>(
        `UPDATE website_settings SET 
          hero_title = ?, 
          hero_subtitle = ?, 
          primary_action_text = ?, 
          secondary_action_text = ?, 
          notification_email = ?, 
          meta_title = ?, 
          google_analytics_id = ?, 
          forms_enabled = ?
        WHERE id = ?`,
        [
          validatedData.hero_title,
          validatedData.hero_subtitle,
          validatedData.primary_action_text,
          validatedData.secondary_action_text,
          validatedData.notification_email,
          validatedData.meta_title,
          validatedData.google_analytics_id,
          formsEnabledJson,
          existing[0].id
        ]
      );
    } else {
      // Insert new
      await pool.query<ResultSetHeader>(
        `INSERT INTO website_settings (
          hero_title, 
          hero_subtitle, 
          primary_action_text, 
          secondary_action_text, 
          notification_email, 
          meta_title, 
          google_analytics_id, 
          forms_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          validatedData.hero_title,
          validatedData.hero_subtitle,
          validatedData.primary_action_text,
          validatedData.secondary_action_text,
          validatedData.notification_email,
          validatedData.meta_title,
          validatedData.google_analytics_id,
          formsEnabledJson
        ]
      );
    }

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
    // This is a combined view of recent submissions from different tables
    const [partnerships] = await pool.query(
      `SELECT 'Partnership' as type, m.full_name as name, p.created_at as date, p.status 
       FROM partnerships p 
       JOIN members m ON p.member_id = m.id 
       ORDER BY p.created_at DESC LIMIT 5`,
      []
    ) as [any[], any];

    const [testimonies] = await pool.query(
      `SELECT 'Testimony' as type, full_name as name, submitted_at as date, status 
       FROM testimonies 
       ORDER BY submitted_at DESC LIMIT 5`,
      []
    ) as [any[], any];

    const [baptismRequests] = await pool.query(
      `SELECT 'Baptism' as type, full_name as name, submitted_at as date, status 
       FROM baptism_requests 
       ORDER BY submitted_at DESC LIMIT 5`,
      []
    ) as [any[], any];

    // Combine and sort by date
    const allSubmissions = [...partnerships, ...testimonies, ...baptismRequests]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    res.json(allSubmissions);
  } catch (error) {
    console.error('Error fetching website submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
