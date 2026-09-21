import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { config } from "./config.ts";
import { SEED_COMPANIES } from "./data/seed-companies.ts";
import {
  RecommendationServiceUnavailableError,
  RecommendationUpstreamError,
  getCompanyRecommendations,
} from "./openai.ts";

const companies = SEED_COMPANIES.slice(0, 2);
const mutableConfig = config as { openaiApiKey?: string };
const originalApiKey = mutableConfig.openaiApiKey;

function mockFetchOnce(overrides: Record<string, unknown> = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...overrides,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  mutableConfig.openaiApiKey = "test-openai-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  mutableConfig.openaiApiKey = originalApiKey;
});

describe("getCompanyRecommendations", () => {
  it("throws RecommendationServiceUnavailableError when no API key is configured", async () => {
    mutableConfig.openaiApiKey = undefined;
    await expect(
      getCompanyRecommendations("정원을 만들고 싶어요", companies),
    ).rejects.toThrow(RecommendationServiceUnavailableError);
  });

  it("returns validated recommendations parsed from the model response", async () => {
    mockFetchOnce({
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                recommendations: [
                  { companyId: companies[0].id, reason: "가족 마당에 잘 맞습니다." },
                ],
              }),
            },
          },
        ],
      }),
    });

    const result = await getCompanyRecommendations(
      "가족과 함께 쓸 마당을 만들고 싶어요",
      companies,
    );

    expect(result).toEqual([
      { companyId: companies[0].id, reason: "가족 마당에 잘 맞습니다." },
    ]);
  });

  it("drops companyIds that are not in the candidate list", async () => {
    mockFetchOnce({
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                recommendations: [
                  { companyId: "made-up-id", reason: "지어낸 업체입니다." },
                  { companyId: companies[0].id, reason: "실제 후보입니다." },
                ],
              }),
            },
          },
        ],
      }),
    });

    const result = await getCompanyRecommendations("아무 내용", companies);

    expect(result).toEqual([
      { companyId: companies[0].id, reason: "실제 후보입니다." },
    ]);
  });

  it("caps recommendations at three even if the model returns more", async () => {
    mockFetchOnce({
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                recommendations: Array.from({ length: 5 }, () => ({
                  companyId: companies[0].id,
                  reason: "이유",
                })),
              }),
            },
          },
        ],
      }),
    });

    const result = await getCompanyRecommendations("아무 내용", companies);
    expect(result).toHaveLength(3);
  });

  it("throws RecommendationUpstreamError when the OpenAI response is not ok", async () => {
    mockFetchOnce({ ok: false, status: 500 });
    await expect(
      getCompanyRecommendations("아무 내용", companies),
    ).rejects.toThrow(RecommendationUpstreamError);
  });

  it("throws RecommendationUpstreamError when the response content is not valid JSON", async () => {
    mockFetchOnce({
      json: async () => ({
        choices: [{ message: { content: "이건 JSON이 아닙니다" } }],
      }),
    });
    await expect(
      getCompanyRecommendations("아무 내용", companies),
    ).rejects.toThrow(RecommendationUpstreamError);
  });

  it("throws RecommendationUpstreamError when fetch itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    await expect(
      getCompanyRecommendations("아무 내용", companies),
    ).rejects.toThrow(RecommendationUpstreamError);
  });
});
