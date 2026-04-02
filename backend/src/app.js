import express from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import authRoutes from './routes/auth.routes.js';
import requestRoutes from './routes/request.routes.js';
import developerRoutes from './routes/developer.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(authRoutes);
app.use(requestRoutes);
app.use(developerRoutes);

app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed.', issues: err.issues });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

export default app;
