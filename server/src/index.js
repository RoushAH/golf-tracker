import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/schema.js';
import drillsRouter from './routes/drills.js';
import sessionsRouter from './routes/sessions.js';
import syncRouter from './routes/sync.js';
import authRouter from './routes/auth.js';
import { optionalAuth } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(optionalAuth);

await initializeDatabase();

app.use('/api/auth', authRouter);
app.use('/api/drills', drillsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/sync', syncRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏌️  Golf Tracker Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Access from this computer: http://localhost:${PORT}`);
});
