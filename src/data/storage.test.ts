import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../types";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
  subscribeToAuthSessionCleared,
} from "./storage";

const session: AuthSession = {
  user: {
    email: "user@example.com",
    name: "홍길동",
    loggedInAt: "2026-01-01T00:00:00.000Z",
  },
  accessToken: "token-abc",
};

beforeEach(() => {
  localStorage.clear();
});

describe("auth session storage", () => {
  it("returns null when nothing is stored", () => {
    expect(loadAuthSession()).toBeNull();
  });

  it("saves and loads the auth session", () => {
    saveAuthSession(session);
    expect(loadAuthSession()).toEqual(session);
  });

  it("clears the auth session", () => {
    saveAuthSession(session);
    clearAuthSession();
    expect(loadAuthSession()).toBeNull();
  });

  it("returns null and removes corrupted JSON", () => {
    localStorage.setItem("wegreen:auth-session", "{not-json");
    expect(loadAuthSession()).toBeNull();
    expect(localStorage.getItem("wegreen:auth-session")).toBeNull();
  });

  it("returns null for a session missing accessToken or user", () => {
    localStorage.setItem(
      "wegreen:auth-session",
      JSON.stringify({ user: session.user }),
    );
    expect(loadAuthSession()).toBeNull();
  });

  it("notifies subscribers when the session is cleared", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAuthSessionCleared(listener);

    saveAuthSession(session);
    clearAuthSession();
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    clearAuthSession();
    expect(listener).toHaveBeenCalledOnce();
  });
});
