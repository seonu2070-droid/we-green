import { config } from "./config.ts";
import type { Company, Recommendation } from "./types.ts";

const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RECOMMENDATIONS = 3;

export class RecommendationServiceUnavailableError extends Error {}
export class RecommendationUpstreamError extends Error {}

interface CompanySummary {
  id: string;
  name: string;
  region: string;
  category: string;
  specialties: string[];
  tagline: string;
}

function summarize(company: Company): CompanySummary {
  return {
    id: company.id,
    name: company.name,
    region: company.region,
    category: company.category,
    specialties: company.specialties,
    tagline: company.tagline,
  };
}

function buildSystemPrompt(): string {
  return [
    "당신은 지역 조경업체 디렉토리 WE:GREEN의 추천 도우미입니다.",
    `사용자가 자유롭게 설명한 상황과, JSON으로 제공되는 후보 업체 목록(candidates)을 보고 가장 잘 맞는 업체를 최대 ${MAX_RECOMMENDATIONS}곳까지 고릅니다.`,
    "반드시 candidates 목록에 있는 id만 사용하고, 목록에 없는 업체를 만들어 내지 않습니다.",
    "적합한 업체가 없다면 recommendations를 빈 배열로 반환합니다.",
    "각 추천에는 사용자의 상황에 맞춘 한국어 한 문장짜리 이유(reason)를 함께 작성합니다.",
    '다음 JSON 형식으로만 응답하세요: {"recommendations":[{"companyId":"...","reason":"..."}]}',
  ].join(" ");
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

interface RawRecommendationPayload {
  recommendations?: { companyId?: unknown; reason?: unknown }[];
}

export async function getCompanyRecommendations(
  message: string,
  companies: Company[],
): Promise<Recommendation[]> {
  if (!config.openaiApiKey) {
    throw new RecommendationServiceUnavailableError(
      "AI 추천 기능이 아직 설정되지 않았습니다.",
    );
  }

  const payload = {
    model: OPENAI_MODEL,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: JSON.stringify({
          request: message,
          candidates: companies.map(summarize),
        }),
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new RecommendationUpstreamError("AI 추천 서비스에 연결하지 못했습니다.");
  }

  if (!response.ok) {
    throw new RecommendationUpstreamError(
      `AI 추천 서비스가 오류를 반환했습니다. (status ${response.status})`,
    );
  }

  const body = (await response
    .json()
    .catch(() => null)) as ChatCompletionResponse | null;
  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new RecommendationUpstreamError("AI 추천 응답을 읽지 못했습니다.");
  }

  let parsed: RawRecommendationPayload;
  try {
    parsed = JSON.parse(content) as RawRecommendationPayload;
  } catch {
    throw new RecommendationUpstreamError("AI 추천 응답 형식이 올바르지 않습니다.");
  }

  const validIds = new Set(companies.map((company) => company.id));
  const recommendations: Recommendation[] = [];
  for (const item of parsed.recommendations ?? []) {
    if (typeof item.companyId !== "string" || !validIds.has(item.companyId)) continue;
    if (typeof item.reason !== "string" || !item.reason.trim()) continue;
    recommendations.push({ companyId: item.companyId, reason: item.reason.trim() });
    if (recommendations.length >= MAX_RECOMMENDATIONS) break;
  }

  return recommendations;
}
