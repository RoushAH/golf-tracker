import express from 'express';
import https from 'https';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { initializeDatabase } from './db/schema.js';
import drillsRouter from './routes/drills.js';
import sessionsRouter from './routes/sessions.js';
import syncRouter from './routes/sync.js';
import authRouter from './routes/auth.js';
import { optionalAuth } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Load SSL certificates
const certPath = join(__dirname, '../certs/cert.pem');
const keyPath = join(__dirname, '../certs/key.pem');
const useHTTPS = existsSync(certPath) && existsSync(keyPath);

let httpsOptions;
if (useHTTPS) {
  httpsOptions = {
    cert: readFileSync(certPath),
    key: readFileSync(keyPath)
  };
  console.log('🔒 HTTPS enabled');
} else {
  console.log('⚠️  No SSL certificates found, using HTTP');
  console.log('   Run generate-cert.bat to enable HTTPS');
}

app.use(cors());
app.use(express.json());
app.use(optionalAuth);

await initializeDatabase();

// API routes
app.use('/api/auth', authRouter);
app.use('/api/drills', drillsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/sync', syncRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Serve static files from client build (production mode)
const clientBuildPath = join(__dirname, '../../client/dist');
if (existsSync(clientBuildPath)) {
  console.log('📱 Serving client from:', clientBuildPath);
  app.use(express.static(clientBuildPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(join(clientBuildPath, 'index.html'));
  });
} else {
  console.log('⚠️  Client not built. Run "npm run build" in client folder or use start-prod.bat');
}

if (useHTTPS) {
  https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
    console.log(`🏌️  Golf Tracker Server running on https://0.0.0.0:${PORT}`);
    console.log(`   Access from this computer: https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏌️  Golf Tracker Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Access from this computer: http://localhost:${PORT}`);
  });
}
