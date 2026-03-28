import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './src/routes/auth.js';
import memberRoutes from './src/routes/members.js';
import financeRoutes from './src/routes/finance.js';
import dashboardRoutes from './src/routes/dashboard.js';
import userRoutes from './src/routes/users.js';
import partnershipRoutes from './src/routes/partnerships.js';
import testimonyRoutes from './src/routes/testimonies.js';
import baptismRoutes from './src/routes/baptism-requests.js';
import mediaRoutes from './src/routes/media.js';
import websiteRoutes from './src/routes/website.js';

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
    res.json({ status: 'ok', message: 'Backend is running with MySQL support' });
  });

  // Use Modular Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/members', memberRoutes);
  app.use('/api/finance', financeRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/partnerships', partnershipRoutes);
  app.use('/api/testimonies', testimonyRoutes);
  app.use('/api/baptism-requests', baptismRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/website', websiteRoutes);

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
    console.log('MySQL connection pool initialized.');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
