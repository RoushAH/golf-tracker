import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/schema.js';
import drillsRouter from './routes/drills.js';
import sessionsRouter from './routes/sessions.js';
import syncRouter from './routes/sync.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

await initializeDatabase();

app.use('/api/drills', drillsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/sync', syncRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🏌️  Golf Tracker Server running on http://localhost:${PORT}`);
});
