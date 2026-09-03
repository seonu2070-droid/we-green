import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { act, renderHook, waitFor } from "@testing-library/react";
import { mswServer } from "../test/msw/server";
import { DEMO_USER, FAKE_ACCESS_TOKEN } from "../test/msw/fixtures";
import { AuthProvider, useAuth } from "./AuthContext";
import { loadAuthSession, saveAuthSession } from "../data/storage";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe("AuthContext", () => {
  it("starts unauthenticated when no session is stored", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAuthLoading).toBe(false);
  });

  it("restores and verifies a previously stored session", async () => {
    saveAuthSession({
      user: { email: DEMO_USER.email, name: DEMO_USER.name, loggedInAt: "" },
      accessToken: FAKE_ACCESS_TOKEN,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthLoading).toBe(true);

    await waitFor(() => expect(result.current.isAuthLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe(DEMO_USER.email);
  });

  it("clears a stored session the server no longer accepts", async () => {
    saveAuthSession({
      user: { email: DEMO_USER.email, name: DEMO_USER.name, loggedInAt: "" },
      accessToken: "expired-token",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(loadAuthSession()).toBeNull();
  });

  it("logs a user in and persists the session", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: DEMO_USER.email,
        password: DEMO_USER.password,
        name: "파트너",
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(loadAuthSession()?.accessToken).toBe(FAKE_ACCESS_TOKEN);
  });

  it("surfaces a login failure without authenticating", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login({
          email: DEMO_USER.email,
          password: "wrong",
          name: "",
        });
      }),
    ).rejects.toThrow();

    expect(result.current.isAuthenticated).toBe(false);
  });

  it("logs a user out and clears storage", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: DEMO_USER.email,
        password: DEMO_USER.password,
        name: "파트너",
      });
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(loadAuthSession()).toBeNull();
  });

  it("ignores an aborted verification request instead of clearing the session", async () => {
    // 세션 확인 요청이 응답하기 전에 컴포넌트가 언마운트되면(예: StrictMode의
    // 이펙트 재실행) AbortController가 요청을 취소한다. 이때는 세션이 유효한지
    // 판단할 수 없으므로, 취소된 요청을 서버 거부로 오인해 세션을 지우면 안 된다.
    mswServer.use(
      http.get("/api/auth/me", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({
          data: { user: { email: DEMO_USER.email, name: DEMO_USER.name, loggedInAt: "" } },
        });
      }),
    );
    saveAuthSession({
      user: { email: DEMO_USER.email, name: DEMO_USER.name, loggedInAt: "" },
      accessToken: FAKE_ACCESS_TOKEN,
    });

    const { unmount } = renderHook(() => useAuth(), { wrapper });
    unmount();

    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(loadAuthSession()?.accessToken).toBe(FAKE_ACCESS_TOKEN);
  });
});
