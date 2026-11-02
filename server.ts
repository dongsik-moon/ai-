import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Helper to initialize Google GenAI safely
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Google AI Studio의 [Settings > Secrets] 패널에서 GEMINI_API_KEY를 선택해주세요.'
    );
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient generateContent with retry and friendly error translation
async function generateContentWithRetry(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
}) {
  const ai = getGenAIClient();
  // Pool of high-speed flash models to guarantee zero 503 downtime
  const models = [
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
  ];

  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType,
          responseSchema: params.responseSchema,
        },
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || err);
      const isTemporary =
        errMsg.includes('503') ||
        errMsg.includes('429') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('RESOURCE_EXHAUSTED');

      if (isTemporary) {
        console.warn(
          `[Career Mission AI] Model ${model} busy (503/429). Instantly failing over to next model...`
        );
        continue; // Instantly failover to the next healthy model
      } else {
        throw err;
      }
    }
  }

  // Translate common API errors into actionable Korean guidance
  const errText = String(lastError?.message || lastError);
  if (errText.includes('503') || errText.includes('UNAVAILABLE')) {
    throw new Error(
      'Gemini AI 서비스에 일시적인 트래픽이 집중되고 있습니다 (503). 잠시 후 다시 시도해주세요.'
    );
  }
  if (errText.includes('429') || errText.includes('RESOURCE_EXHAUSTED')) {
    throw new Error(
      'AI 호출 한도가 일시적으로 초과되었습니다. 잠시 후 다시 시도하거나 Settings > Secrets에서 키를 확인해주세요.'
    );
  }
  if (errText.includes('403') || errText.includes('PERMISSION_DENIED')) {
    throw new Error(
      'API 키 권한 오류가 발생했습니다. Settings > Secrets 패널에서 유효한 GEMINI_API_KEY가 선택되어 있는지 확인해주세요.'
    );
  }

  throw lastError || new Error('AI 모델 응답 생성 실패');
}

// Clean markdown code blocks from JSON string if any
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// 1. Comprehensive Diagnosis API
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const { profile, skills, completedMissions, portfolioItems } = req.body;

    const prompt = `
[사용자 프로필 정보]
- 이름/목표: ${profile?.name || '지원자'} / ${profile?.targetRole || '현대자동차 R&D 차량설계 및 차체해석 엔지니어'}
- 최종학력 및 전공: ${profile?.education || '미입력'} ${profile?.major || ''} (학점: ${profile?.gpa || '미입력'})
- 수강 관련 교과목: ${profile?.relevantCourses?.join(', ') || '미입력'}
- 보유 자격증: ${profile?.certifications?.join(', ') || '없음'}
- 실무 및 프로젝트 경험: ${profile?.experiences?.map((e: any) => `${e.title} (${e.role}): ${e.description}`).join('; ') || '없음'}
- 보유 툴 역량 수준:
${profile?.toolProficiencies?.map((t: any) => `  * ${t.toolName}: ${t.level} (설명: ${t.note || '-'})`).join('\n') || '미입력'}
- 지원 서류 요약:
  * 자기소개서 초안: ${profile?.applicationDocuments?.coverLetter ? profile.applicationDocuments.coverLetter.slice(0, 1000) : '미등록'}
  * 경험기술서 초안: ${profile?.applicationDocuments?.experienceDoc ? profile.applicationDocuments.experienceDoc.slice(0, 1000) : '미등록'}
- 현재까지 등록된 포트폴리오: ${portfolioItems?.map((p: any) => `${p.title} (${p.category}, 도구: ${p.tools})`).join(', ') || '없음'}
- 완료한 취업 미션 수: ${completedMissions?.length || 0}개

위 사용자의 데이터를 바탕으로 현대자동차 R&D 차량설계(BIW, 패키징, CATIA V5) 및 차체해석(구조/충돌/내구 CAE, FEA) 엔지니어 채용 기준에 맞추어 종합 역량 진단을 수행하세요.
없는 사실을 지어내지 말고, 확인된 사실과 미확인/부족한 항목을 엄격히 구분하여 아래 JSON 스키마에 맞춰 응답하세요.
`;

    const rawText = await generateContentWithRetry({
      contents: prompt,
      systemInstruction: `당신은 현대자동차 R&D 차량설계 및 차체해석 엔지니어 채용에 정통한 R&D 수석 평가관이자 기술 면접관입니다.
지원자의 역량을 비판적이면서도 건설적인 관점으로 분석하세요.
특히 CATIA V5 서피스/솔리드 모델링 능력, 차체 BIW 구조 이해, 재료(고장력강/알루미늄) 및 성형/접합 공법, 유한요소해석(FEA) 기초(메시, 요소타입, 구속/하중 조건), 해석과 실차 시험 상관성 검증, STAR 기반 정량적 문제 해결력 관점에서 실질적인 취업 격차를 진단해야 합니다.
반드시 정확한 JSON 객체로만 응답하세요.`,
      responseMimeType: 'application/json',
    });

    const cleaned = cleanJsonString(rawText || '{}');
    const data = JSON.parse(cleaned);
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
    const { profile, settings, existingMissionTitles } = req.body;

    const {
      purpose = '부족 역량 보완',
      difficulty = '기초',
      duration = '2~3시간',
      priority = '높음',
      count = 3,
      deliverableType = '기술 보고서',
    } = settings || {};

    const prompt = `
[지원자 상태 요약]
- 목표: 현대자동차 R&D 차량설계 및 차체해석 엔지니어
- 전공/학력: ${profile?.education || '기계공학 전공'} ${profile?.major || ''}
- 보유 기술: ${profile?.toolProficiencies?.map((t: any) => `${t.toolName}(${t.level})`).join(', ') || 'CATIA 기초, 재료역학'}
- 기존에 이미 등록되었거나 완료한 미션 제목들 (중복 생성 금지):
${existingMissionTitles?.map((t: string) => `  * ${t}`).join('\n') || '  (없음)'}

[미션 생성 설정 조건]
- 생성 목적: ${purpose}
- 난이도: ${difficulty}
- 예상 소요 시간: ${duration}
- 우선순위: ${priority}
- 생성 개수: 정확히 ${count}개
- 결과물 유형: ${deliverableType}

위 설정에 맞춰, 현대자동차 R&D 차량설계·차체해석 직무 지원자가 실제 포트폴리오나 면접 증빙으로 쓸 수 있는 실증적 결과물 중심의 미션을 ${count}개 생성해주세요.
반드시 아래 JSON 스키마를 만족하는 배열이 포함된 객체 형태({"missions": [...]})로 응답하세요.
각 미션은 구체적이고 실현 가능해야 하며, 실행 단계(steps), 제출 결과물(deliverables), 완료 조건(completionCriteria), 평가 기준(evaluationCriteria), 적절한 XP를 명시해야 합니다.
`;

    const rawText = await generateContentWithRetry({
      contents: prompt,
      systemInstruction: `당신은 현대자동차 R&D 차량설계 및 차체해석 엔지니어 양성을 담당하는 테크니컬 리더입니다.
미션은 추상적이지 않고 실무적이어야 합니다.
예: "CATIA V5로 B-필러(B-Pillar) 보강재 형상 모델링 후 단면 2차 모멘트 검토 보고서 작성 (1페이지)", "오픈소스 FEA 또는 수작업 굽힘/비틀림 강성 계산 비교", "현대자동차 최신 플랫폼(E-GMP 등) 차체 경량화 구조 분석서 작성" 등.
이미 생성된 미션과 중복되지 않도록 유의하세요.
반드시 {"missions": [...]} 형태의 JSON 객체로 반환하세요.`,
      responseMimeType: 'application/json',
    });

    const cleaned = cleanJsonString(rawText || '{"missions": []}');
    const data = JSON.parse(cleaned);
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
    const { messages, userContext } = req.body;

    const formattedConversation = (messages || [])
      .map((m: any) => `${m.role === 'assistant' ? 'AI 코치' : '지원자'}: ${m.content}`)
      .join('\n\n');

    const systemInstruction = `당신은 현대자동차 R&D 차량설계 및 차체해석 엔지니어 취업 전문 AI 수석 코치 'Career Mission AI'입니다.
지원자가 현대자동차 R&D 채용(차량설계: BIW, 샤시/의장 패키징, CATIA V5, 도면 해독, 공차 분석 / 차체해석: 구조강성, 내구, NVH, 충돌안전, FEA, HyperMesh, ANSYS, Abaqus)을 체계적으로 준비할 수 있도록 전문적이고 친절하며 엔지니어링 깊이가 있는 답변을 제공하세요.
- 답변 시 공학적 개념(예: 폰 미세스 응력, 셸 요소 vs 솔리드 요소, 비틀림 강성(kNm/deg), AHSS 초고장력강 성형성 등)을 정확하게 설명하세요.
- 사용자의 경험을 현대차 직무 면접에서 매력적으로 어필할 수 있는 STAR(Situation, Task, Action, Result) 기법으로 가이드하세요.
- 허위 사실을 조장하거나 비공개 기밀을 알고 있다고 단정하지 말고, 공개된 기술 트렌드 및 공식 직무 요구 역량을 근거로 답변하세요.
- 한국어로 명확하고 가독성 높게 (마크다운 불릿 및 하이라이트 활용) 답변하세요.`;

    const prompt = `[이전 대화 내용]\n${formattedConversation}\n\n위 대화에 이어 현대자동차 R&D 취업 코치로서 마지막 질문에 대한 전문적인 답변을 작성하세요.`;

    const reply = await generateContentWithRetry({
      contents: prompt,
      systemInstruction,
    });

    res.json({ reply: reply || '답변을 생성하지 못했습니다.' });
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
    const { portfolioItem } = req.body;

    const prompt = `
[프로젝트 정보]
- 프로젝트명: ${portfolioItem.title}
- 카테고리: ${portfolioItem.category}
- 관련 직무 역량: ${portfolioItem.competenceTag}
- 수행 목적: ${portfolioItem.purpose}
- 본인의 역할: ${portfolioItem.role}
- 사용 도구: ${portfolioItem.tools}
- 문제 정의: ${portfolioItem.problemDefinition}
- 수행 과정: ${portfolioItem.workflow}
- 분석/실험 결과: ${portfolioItem.results}
- 핵심 성과: ${portfolioItem.achievements}
- 배운 점: ${portfolioItem.lessonsLearned}

위 프로젝트를 현대자동차 R&D 차량설계 및 차체해석 실무 면접관의 시각에서 첨삭하고 피드백해주세요.
반드시 아래 JSON 스키마로 응답하세요:
{
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["보완해야 할 점1", "보완해야 할 점2"],
  "starRecommendations": [
    "상황(Situation)과 과제(Task) 보완 가이드",
    "행동(Action)에서 엔지니어링 근거(수식, 공학 도구, 파라미터) 강화 팁",
    "결과(Result)의 정량적 수치 표현 개선 방안"
  ],
  "expectedInterviewQuestions": [
    "면접 예상 질문 1 (기술적 검증)",
    "면접 예상 질문 2 (설계 타당성 및 트레이드오프)",
    "면접 예상 질문 3 (현대차 차체 적용 연계)"
  ]
}
`;

    const rawText = await generateContentWithRetry({
      contents: prompt,
      systemInstruction: '당신은 현대자동차 R&D 차량설계·차체해석 실무진 면접관입니다. 포트폴리오를 공학적 완성도, 검증 논리, 정량적 성과 관점에서 날카롭고 구체적으로 피드백하세요. 유효한 JSON 객체로만 응답하세요.',
      responseMimeType: 'application/json',
    });

    const cleaned = cleanJsonString(rawText || '{}');
    const data = JSON.parse(cleaned);
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
