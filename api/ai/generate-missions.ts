import { executeGenerateMissionsService } from '../../src/server/geminiService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const result = await executeGenerateMissionsService(body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Vercel API: /api/ai/generate-missions] Error:', error);
    return res.status(500).json({
      error: error?.message || '미션 생성 중 오류가 발생했습니다.',
    });
  }
}
