import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { loadAuthUser } from "../data/storage";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe("AuthContext", () => {
  it("starts unauthenticated when no user is stored", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("restores a previously logged-in user from storage", () => {
    localStorage.setItem(
      "wegreen:auth",
      JSON.stringify({
        email: "user@example.com",
        name: "홍길동",
        loggedInAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("user@example.com");
  });

  it("logs a user in and persists it to storage", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login({
        email: "new@example.com",
        password: "1234",
        name: "",
      });
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user?.name).toBe("new");
    expect(loadAuthUser()?.email).toBe("new@example.com");
  });

  it("logs a user out and clears storage", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: "user@example.com",
        password: "1234",
        name: "홍길동",
      });
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(loadAuthUser()).toBeNull();
  });
});
