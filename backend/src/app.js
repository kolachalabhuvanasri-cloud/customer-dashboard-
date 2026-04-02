import express from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import authRoutes from './routes/auth.routes.js';
import requestRoutes from './routes/request.routes.js';
import developerRoutes from './routes/developer.routes.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_ORIGIN ? [process.env.FRONTEND_ORIGIN] : [])
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    }
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'customer-dashboard-backend' });
});

app.use(authRoutes);
app.use(requestRoutes);
app.use(developerRoutes);

app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed.', issues: err.issues });
  }

  if (err?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ message: 'CORS origin denied.' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

export default app;
