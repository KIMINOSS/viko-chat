import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface TranslateResult {
  translated: string;
  sourceLang: 'ko' | 'vi';
  targetLang: 'ko' | 'vi';
}

/**
 * 베트남어-한국어 양방향 번역
 * 컨텍스트를 고려한 자연스러운 대화체 번역
 */
export async function translateMessage(
  text: string,
  context?: string[]
): Promise<TranslateResult> {
  const contextStr = context?.length
    ? `\n\n이전 대화:\n${context.slice(-5).join('\n')}`
    : '';

  const prompt = `You are a professional Vietnamese-Korean translator for a chat app.

Task: Translate the following message naturally, considering the chat context.

Rules:
1. Auto-detect the source language (Korean or Vietnamese)
2. Translate to the other language
3. Keep the tone conversational and natural
4. Handle slang, idioms, and cultural expressions appropriately
5. Do NOT translate proper nouns (names, places) unless necessary

${contextStr}

Message to translate:
"${text}"

Respond in JSON format only:
{
  "translated": "번역된 텍스트",
  "sourceLang": "ko" or "vi",
  "targetLang": "ko" or "vi"
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid translation response');
  }

  return JSON.parse(jsonMatch[0]) as TranslateResult;
}

/**
 * 언어 감지
 */
export async function detectLanguage(text: string): Promise<'ko' | 'vi' | 'unknown'> {
  const prompt = `Detect the language of this text. Reply with only: "ko" for Korean, "vi" for Vietnamese, or "unknown".

Text: "${text}"`;

  const result = await model.generateContent(prompt);
  const lang = result.response.text().trim().toLowerCase();

  if (lang === 'ko' || lang === 'vi') return lang;
  return 'unknown';
}
