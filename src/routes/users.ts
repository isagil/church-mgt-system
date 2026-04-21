import express from 'express';
import { z } from 'zod';
import { getLocalUsers, addLocalUser, updateLocalUser, deleteLocalUser } from '../lib/localUsers.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = getLocalUsers();
    // Don't send passwords over the wire for the list
    const safeUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      created_at: u.created_at
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = getLocalUsers();
    const user = users.find(u => u.id === id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Return without password
    const { password, password_hash, ...safeUser } = user as any;
    res.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const newUser = addLocalUser({
      username: body.username,
      password: body.password,
      role: body.role || 'Media',
      permissions: body.permissions || {
        "members": {"view": true, "edit": false},
        "finance": {"view": false, "edit": false},
        "testimonies": {"view": true, "edit": false},
        "media": {"view": true, "edit": true},
        "website": {"view": false, "edit": false},
        "users": {"view": false, "edit": false}
      }
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      created_at: newUser.created_at
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updated = updateLocalUser(id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteLocalUser(id);
    if (!success) return res.status(404).json({ error: 'User not found' });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
