import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/renderWithProviders";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.click(screen.getByRole("button", { name: "로그인하기" }));

    expect(await screen.findByText("이메일을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
  });

  it("logs in and shows a loading state while submitting", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/이메일/), "user@example.com");
    await user.type(screen.getByLabelText(/비밀번호/), "1234");
    await user.click(screen.getByRole("button", { name: "로그인하기" }));

    expect(await screen.findByText("로그인 처리 중...")).toBeInTheDocument();
  });
});
