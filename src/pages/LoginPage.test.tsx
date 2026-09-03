import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { mswServer } from "../test/msw/server";
import { renderWithProviders } from "../test/renderWithProviders";
import { DEMO_USER } from "../test/msw/fixtures";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.click(screen.getByRole("button", { name: "로그인하기" }));

    expect(await screen.findByText("이메일을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
  });

  it("shows a loading state while the login request is in flight", async () => {
    // 실제 응답에 걸리는 시간을 흉내 내지 않으면(즉시 resolve) 로딩 문구가
    // 렌더링과 동시에 사라져 버려 테스트가 관찰할 기회를 놓친다.
    mswServer.use(
      http.post("/api/auth/login", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({
          data: {
            user: { email: DEMO_USER.email, name: DEMO_USER.name, loggedInAt: "" },
            accessToken: "test-access-token",
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/이메일/), DEMO_USER.email);
    await user.type(screen.getByLabelText(/비밀번호/), DEMO_USER.password);
    await user.click(screen.getByRole("button", { name: "로그인하기" }));

    expect(await screen.findByText("로그인 처리 중...")).toBeInTheDocument();
  });

  it("shows the server error message for invalid credentials", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/이메일/), DEMO_USER.email);
    await user.type(screen.getByLabelText(/비밀번호/), "wrong-password");
    await user.click(screen.getByRole("button", { name: "로그인하기" }));

    expect(
      await screen.findByText("이메일 또는 비밀번호가 올바르지 않습니다."),
    ).toBeInTheDocument();
  });
});
