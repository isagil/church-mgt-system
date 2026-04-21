import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import memberRoutes from './src/routes/members.js';
import financeRoutes from './src/routes/finance.js';
import dashboardRoutes from './src/routes/dashboard.js';
import userRoutes from './src/routes/users.js';
import partnershipRoutes from './src/routes/partnerships.js';
import testimonyRoutes from './src/routes/testimonies.js';
import baptismRoutes from './src/routes/baptism-requests.js';
import mediaRoutes from './src/routes/media.js';
import websiteRoutes from './src/routes/website.js';
import authRoutes from './src/routes/auth.js';
import storageRoutes from './src/routes/storage.js';
import { authenticateToken, authorizeRole } from './src/middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running and connected to Supabase' });
  });

  // Authentication Route (Public)
  app.use('/api/auth', authRoutes);

  // Use Modular Routes (Protected with Role-Based Access)
  app.use('/api/members', authenticateToken, authorizeRole(['Pastor', 'Finance']), memberRoutes);
  app.use('/api/finance', authenticateToken, authorizeRole(['Finance']), financeRoutes);
  app.use('/api/dashboard', authenticateToken, dashboardRoutes); // Everyone can see dashboard
  app.use('/api/users', authenticateToken, authorizeRole(['Admin']), userRoutes);
  app.use('/api/partnerships', authenticateToken, authorizeRole(['Finance', 'Pastor']), partnershipRoutes);
  app.use('/api/testimonies', authenticateToken, authorizeRole(['Media', 'Pastor']), testimonyRoutes);
  app.use('/api/baptism-requests', authenticateToken, authorizeRole(['Pastor']), baptismRoutes);
  app.use('/api/media', authenticateToken, authorizeRole(['Media', 'Pastor']), mediaRoutes);
  app.use('/api/storage', authenticateToken, authorizeRole(['Media', 'Pastor']), storageRoutes);
  app.use('/api/website', authenticateToken, authorizeRole(['Media']), websiteRoutes); 

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Connected to Supabase database.');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
