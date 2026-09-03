import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/renderWithProviders";
import { RegisterPage } from "./RegisterPage";
import { saveAuthUser } from "../data/storage";

beforeEach(() => {
  localStorage.clear();
  saveAuthUser({
    email: "user@example.com",
    name: "홍길동",
    loggedInAt: "2026-01-01T00:00:00.000Z",
  });
});

describe("RegisterPage", () => {
  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: "/register" });

    await user.click(screen.getByRole("button", { name: "등록 신청서 제출하기" }));

    expect(
      await screen.findByText("전문 분야를 한 개 이상 선택해 주세요."),
    ).toBeInTheDocument();
    expect(screen.getByText("약관에 동의해 주세요.")).toBeInTheDocument();
  });

  it("submits successfully and shows a loading state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: "/register" });

    await user.type(screen.getByLabelText(/^업체명/), "새 조경");
    await user.selectOptions(screen.getByLabelText(/사업자 구분/), "개인사업자");
    await user.type(
      screen.getByLabelText(/업체 소개/),
      "20자 이상 작성된 업체 소개 문구를 입력합니다.",
    );
    await user.selectOptions(screen.getByLabelText(/주요 활동 지역/), "서울");
    await user.click(screen.getByLabelText("주택 정원 조성"));
    await user.type(screen.getByLabelText(/^담당자 이름/), "김담당");
    await user.type(screen.getByLabelText(/^이메일/), "new@example.com");
    await user.click(
      screen.getByLabelText(/업체 등록 검토를 위한 정보 확인/),
    );

    await user.click(screen.getByRole("button", { name: "등록 신청서 제출하기" }));

    expect(
      await screen.findByText("등록 정보를 저장하는 중..."),
    ).toBeInTheDocument();
  });
});
