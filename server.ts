import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import rateLimit from 'express-rate-limit';
import { createGeminiRouter } from './routes/gemini';
import { createMandiRouter } from './routes/mandi';
import { createMarketplaceRouter } from './routes/marketplace';
import { createServicesRouter } from './routes/services';

dotenv.config();

// ─── Startup Validation ────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const isProdMode = process.env.NODE_ENV === 'production';
if (!GEMINI_API_KEY) {
  if (isProdMode) {
    console.error('FATAL: GEMINI_API_KEY environment variable is not set.');
    console.error('Copy .env.example to .env and fill in your API keys.');
    process.exit(1);
  } else {
    console.warn('⚠️  GEMINI_API_KEY not set — AI features will return 503 in dev mode.');
    console.warn('   Copy .env.example to .env and add your key for full functionality.');
  }
}

// ─── App Setup ─────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Trust the first proxy hop in cloud/container environments (Cloud Run/reverse proxy)
app.set('trust proxy', 1);

app.use(express.json({ limit: '25mb' }));

// ─── Gemini Client ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// ─── Rate Limiting (30 req / min per IP for all /api routes) ──────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { error: 'Too many requests, please try again after a minute.' }
});

app.use('/api', apiLimiter);

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/gemini', createGeminiRouter(genAI));
app.use('/api/mandi', createMandiRouter());
app.use('/api/marketplace', createMarketplaceRouter());
app.use('/api/services', createServicesRouter());

// Server tool executor endpoint
app.post('/api/tools/execute', (req: Request, res: Response) => {
  const { toolName, args } = req.body;
  res.json({
    tool: toolName,
    status: 'success',
    timestamp: new Date().toISOString(),
    args
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Vite Dev Server Integration & Static Serving ─────────────────────────────
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kheti AI server running on http://0.0.0.0:${PORT} [Model: Gemini 1.5 Flash]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
