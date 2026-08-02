import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { ensureUploadDirs, UPLOAD_ROOT } from './utils/localFiles.js';

dotenv.config();
ensureUploadDirs();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:7310',
  'https://projectsphere-ai.netlify.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Local file uploads (offline — no Cloudinary)
app.use('/uploads', express.static(UPLOAD_ROOT));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      const color = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
      console.log(`${color}[${res.statusCode}]\x1b[0m ${req.method} ${req.originalUrl} — ${ms}ms`);
    });
    next();
  });
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('\x1b[31m[DATABASE ERROR]\x1b[0m:', err.message);
    res.status(500).json({
      message: 'Database connection failed. Please check MongoDB is running.',
      error: err.message
    });
  }
});

import authRoutes             from './routes/auth.routes.js';
import studentRoutes          from './routes/student.routes.js';
import facultyRoutes          from './routes/faculty.routes.js';
import hodRoutes              from './routes/hod.routes.js';
import adminRoutes            from './routes/admin.routes.js';
import deadlineRoutes         from './routes/deadline.routes.js';
import notificationRoutes     from './routes/notification.routes.js';
import announcementRoutes     from './routes/announcement.routes.js';
import projectRoutes          from './routes/project.routes.js';

app.use('/api/auth',          authRoutes);
app.use('/api/student',       studentRoutes);
app.use('/api/faculty',       facultyRoutes);
app.use('/api/hod',           hodRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/deadlines',     deadlineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/projects',      projectRoutes);

app.get('/', (req, res) => res.json({ status: 'ProjectSphere API running ✅', env: process.env.NODE_ENV, mode: 'local-offline' }));

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[32m[SERVER]\x1b[0m Running → http://0.0.0.0:${PORT}`);
    console.log(`\x1b[36m[UPLOADS]\x1b[0m Local disk → ${UPLOAD_ROOT}`);
    console.log('\x1b[36m[ROUTES]\x1b[0m /api/auth | /api/student | /api/faculty | /api/hod | /api/admin | /uploads');
  });
}

export default app;
