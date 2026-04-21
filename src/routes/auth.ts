import express from 'express';
import { supabase } from '../lib/supabase.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { findLocalUserByUsername } from '../lib/localUsers.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pmcc_secret_key_2026';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const username = body.username.trim();
    const password = body.password.trim();

    // 1. Try Local System login first
    const localUser = findLocalUserByUsername(username);
    if (localUser) {
      // Check plain text password for local system
      if (password === localUser.password || password === localUser.password_hash) {
        const token = jwt.sign(
          { 
            id: localUser.id, 
            username: localUser.username, 
            role: localUser.role,
            permissions: localUser.permissions 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          token,
          user: {
            id: localUser.id,
            username: localUser.username,
            role: localUser.role,
            permissions: localUser.permissions
          }
        });
      }
    }

    // 2. Fallback to Supabase Database
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (dbUser) {
      // Verify password (plain text as per recent change)
      const isMatch = password === dbUser.password_hash;
      if (isMatch) {
        const token = jwt.sign(
          { 
            id: dbUser.id, 
            username: dbUser.username, 
            role: dbUser.role,
            permissions: dbUser.permissions 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          token,
          user: {
            id: dbUser.id,
            username: dbUser.username,
            role: dbUser.role,
            permissions: dbUser.permissions
          }
        });
      }
    }

    // If we reach here, authentication failed
    console.warn(`Login failed for user: ${username}`);
    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error during login' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
