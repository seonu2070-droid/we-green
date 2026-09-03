import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession, AuthUser, LoginFormValues } from "../types";
import { getCurrentUser, loginWithApi } from "../data/api";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
  subscribeToAuthSessionCleared,
} from "../data/storage";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    loadAuthSession(),
  );
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(session));
  const sessionRevision = useRef(0);

  const clearSession = useCallback(() => {
    sessionRevision.current += 1;
    clearAuthSession();
    setSession(null);
    setIsAuthLoading(false);
  }, []);

  useEffect(
    () =>
      subscribeToAuthSessionCleared(() => {
        sessionRevision.current += 1;
        setSession(null);
        setIsAuthLoading(false);
      }),
    [],
  );

  useEffect(() => {
    if (!session) return;

    const controller = new AbortController();
    const verificationRevision = sessionRevision.current;
    getCurrentUser(controller.signal)
      .then((user) => {
        if (verificationRevision !== sessionRevision.current) return;
        const verifiedSession = { ...session, user };
        saveAuthSession(verifiedSession);
        setSession(verifiedSession);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        if (verificationRevision !== sessionRevision.current) return;
        clearSession();
      })
      .finally(() => {
        if (verificationRevision === sessionRevision.current) {
          setIsAuthLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (values: LoginFormValues) => {
    const nextSession = await loginWithApi(values);
    sessionRevision.current += 1;
    saveAuthSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = clearSession;

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isAuthLoading,
      login,
      logout,
    }),
    [session, isAuthLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
