import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  executeDiagnosisService,
  executeGenerateMissionsService,
  executeChatService,
  executeCritiquePortfolioService,
} from './src/server/geminiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    environment: process.env.VERCEL ? 'vercel' : 'local',
  });
});

// 1. Comprehensive Diagnosis API
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const data = await executeDiagnosisService(req.body);
    res.json(data);
  } catch (error: any) {
    console.error('Diagnosis API error:', error);
    res.status(500).json({
      error: error?.message || 'AI 진단 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
});

// 2. Custom Mission Generation API
app.post('/api/ai/generate-missions', async (req, res) => {
  try {
    const data = await executeGenerateMissionsService(req.body);
    res.json(data);
  } catch (error: any) {
    console.error('Mission generator API error:', error);
    res.status(500).json({
      error: error?.message || '미션 생성 중 오류가 발생했습니다.',
    });
  }
});

// 3. AI Career Coach Chat API
app.post('/api/ai/chat', async (req, res) => {
  try {
    const data = await executeChatService(req.body);
    res.json(data);
  } catch (error: any) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: error?.message || 'AI 코칭 대화 중 오류가 발생했습니다.',
    });
  }
});

// 4. Portfolio AI Critique API
app.post('/api/ai/critique-portfolio', async (req, res) => {
  try {
    const data = await executeCritiquePortfolioService(req.body);
    res.json(data);
  } catch (error: any) {
    console.error('Portfolio critique error:', error);
    res.status(500).json({
      error: error?.message || '포트폴리오 첨삭 중 오류가 발생했습니다.',
    });
  }
});

// Vite Middleware for Dev / Static Serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Career Mission AI Server] running on http://localhost:${PORT}`);
  });
}

startServer();
