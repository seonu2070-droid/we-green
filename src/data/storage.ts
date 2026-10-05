import type { AuthSession } from "../types";
import { isAuthSession } from "./guards";

const AUTH_SESSION_KEY = "wegreen:auth-session";
const sessionClearedListeners = new Set<() => void>();

export function loadAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    const session: unknown = JSON.parse(raw);
    if (isAuthSession(session)) return session;
  } catch {
    // 손상된 세션은 아래에서 제거합니다.
  }

  localStorage.removeItem(AUTH_SESSION_KEY);
  return null;
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
  sessionClearedListeners.forEach((listener) => listener());
}

export function subscribeToAuthSessionCleared(listener: () => void): () => void {
  sessionClearedListeners.add(listener);
  return () => sessionClearedListeners.delete(listener);
}
