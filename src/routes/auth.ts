import express from 'express';
import jwt from 'jsonwebtoken';
import { users, getNextId } from '../mockData.js';
import { authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pmcc_secret_key_2026';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(['Admin', 'Pastor', 'Finance', 'Media']).default('Admin'),
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Always succeed for development/bypass
    const token = jwt.sign(
      { id: 1, username: username || 'admin', role: 'Admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: { id: 1, username: username || 'admin', role: 'Admin' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const user = users.find(u => u.id === userId);
    if (!user) {
      // Fallback for bypassed auth
      return res.json({ id: 1, username: 'admin', role: 'Admin', created_at: new Date().toISOString() });
    }
    const { password, ...userWithoutPassword } = user as any;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, role } = registerSchema.parse(req.body);

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const newUser = {
      id: getNextId('users'),
      username,
      role,
      created_at: new Date().toISOString()
    };
    users.push(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: newUser.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
