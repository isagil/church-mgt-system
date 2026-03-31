import express from 'express';
import { users, getNextId } from '../mockData.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

const userUpdateSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['Admin', 'Pastor', 'Finance', 'Media']).optional(),
});

// Get all users
router.get('/', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const userList = users.map(({ id, username, role, created_at }) => ({ id, username, role, created_at }));
    res.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single user
router.get('/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === parseInt(id as string));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user as any;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a user
router.put('/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = userUpdateSchema.parse(req.body);
    
    const index = users.findIndex(u => u.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (data.username) users[index].username = data.username;
    if (data.role) users[index].role = data.role;
    // In mock mode we don't really care about password hashing for now
    // but we could store it if needed.

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a user
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent self-deletion
    if (Number(id) === (req as any).user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const index = users.findIndex(u => u.id === parseInt(id as string));
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    users.splice(index, 1);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
