import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { mswServer } from "../../test/msw/server";
import { renderWithProviders } from "../../test/renderWithProviders";
import { FIXTURE_COMPANIES } from "../../test/msw/fixtures";
import { AiRecommendSection } from "./AiRecommendSection";

beforeEach(() => {
  localStorage.clear();
});

describe("AiRecommendSection", () => {
  it("shows a validation error without calling the API for a short message", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AiRecommendSection />);

    await user.type(
      screen.getByLabelText(/원하시는 정원이나 상황을 설명해 주세요/),
      "짧음",
    );
    await user.click(screen.getByRole("button", { name: "AI에게 추천받기" }));

    expect(
      await screen.findByText("5자 이상 입력해 주세요."),
    ).toBeInTheDocument();
  });

  it("shows recommended companies with a reason on success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AiRecommendSection />);

    await user.type(
      screen.getByLabelText(/원하시는 정원이나 상황을 설명해 주세요/),
      "강아지와 뛰어놀 수 있는 마당을 원해요",
    );
    await user.click(screen.getByRole("button", { name: "AI에게 추천받기" }));

    expect(
      await screen.findByText(FIXTURE_COMPANIES[0].name),
    ).toBeInTheDocument();
    expect(screen.getByText("테스트 추천 이유입니다.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "추천 업체 1곳을 찾았습니다.",
    );
  });

  it("keeps the submit button rendered and aria-disabled while loading", async () => {
    mswServer.use(
      http.post("/api/recommend", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({ data: { recommendations: [] } });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<AiRecommendSection />);

    await user.type(
      screen.getByLabelText(/원하시는 정원이나 상황을 설명해 주세요/),
      "로딩 중 버튼 상태를 확인합니다",
    );
    await user.click(screen.getByRole("button", { name: "AI에게 추천받기" }));

    expect(
      await screen.findByText("어울리는 업체를 찾는 중..."),
    ).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "AI에게 추천받기" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();

    await waitFor(() =>
      expect(
        screen.queryByText("어울리는 업체를 찾는 중..."),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "AI에게 추천받기" }),
    ).toHaveAttribute("aria-disabled", "false");
  });

  it("shows an empty state when there are no matches", async () => {
    mswServer.use(
      http.post("/api/recommend", () =>
        HttpResponse.json({ data: { recommendations: [] } }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<AiRecommendSection />);

    await user.type(
      screen.getByLabelText(/원하시는 정원이나 상황을 설명해 주세요/),
      "조건에 맞는 업체가 없는 상황을 설명합니다",
    );
    await user.click(screen.getByRole("button", { name: "AI에게 추천받기" }));

    expect(
      await screen.findAllByText("조건에 맞는 업체를 찾지 못했습니다."),
    ).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent(
      "조건에 맞는 업체를 찾지 못했습니다.",
    );
  });

  it("shows an error banner when the request fails", async () => {
    mswServer.use(
      http.post("/api/recommend", () =>
        HttpResponse.json(
          {
            error: {
              code: "AI_UNAVAILABLE",
              message: "AI 추천 기능을 사용할 수 없습니다.",
            },
          },
          { status: 503 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<AiRecommendSection />);

    await user.type(
      screen.getByLabelText(/원하시는 정원이나 상황을 설명해 주세요/),
      "AI 기능을 사용할 수 없는 상황을 테스트합니다",
    );
    await user.click(screen.getByRole("button", { name: "AI에게 추천받기" }));

    expect(
      await screen.findByText("AI 추천 기능을 사용할 수 없습니다."),
    ).toBeInTheDocument();
  });
});
