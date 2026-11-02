/**
 * Resilient API client for Career Mission AI
 * Safely handles JSON responses, Vercel Serverless Functions 404s, and HTML redirects
 */

export async function safePostJson<T = any>(
  url: string,
  payload: any
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (networkErr: any) {
    throw new Error(
      `네트워크 연결 오류: ${networkErr?.message || '서버에 연결할 수 없습니다.'}`
    );
  }

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  let data: any = null;
  const isLikelyJson =
    contentType.includes('application/json') ||
    text.trim().startsWith('{') ||
    text.trim().startsWith('[');

  if (isLikelyJson) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  // Handle HTTP errors
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        'Vercel API 경로를 찾을 수 없습니다 (404). Vercel 프로젝트에 /api 디렉토리의 Serverless Functions와 vercel.json 설정이 포함되어 배포되었는지 확인해주세요.'
      );
    }
    if (data && data.error) {
      throw new Error(data.error);
    }
    if (
      text.includes('The page could not be found') ||
      text.includes('NOT_FOUND')
    ) {
      throw new Error(
        'Vercel에서 해당 API 경로(/api/...)를 찾을 수 없습니다. Vercel 프로젝트 배포에 /api 디렉토리가 포함되어 있는지 확인해주세요.'
      );
    }
    throw new Error(
      `서버 요청 실패 (${res.status}): ${text.slice(0, 120)}`
    );
  }

  // Handle case where status was 200 but returned HTML (e.g. SPA index.html fallback)
  if (!data) {
    if (
      text.includes('The page could not be found') ||
      text.includes('<!doctype') ||
      text.includes('<html')
    ) {
      throw new Error(
        '서버가 JSON 대신 HTML 페이지를 반환했습니다. Vercel 프로젝트의 vercel.json rewrites 설정 또는 환경변수(GEMINI_API_KEY)를 확인해주세요.'
      );
    }
    throw new Error(`서버 응답 형식 오류: ${text.slice(0, 100)}`);
  }

  return data as T;
}
