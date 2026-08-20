import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser, LoginFormValues } from "../types";
import { clearAuthUser, loadAuthUser, saveAuthUser } from "../data/storage";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthUser());

  const login = useCallback(async (values: LoginFormValues) => {
    // 실제 API 없이 짧은 지연으로 로딩 UX만 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 600));
    const nextUser: AuthUser = {
      email: values.email.trim(),
      name: values.name.trim() || values.email.split("@")[0],
      loggedInAt: new Date().toISOString(),
    };
    saveAuthUser(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthUser();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
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
