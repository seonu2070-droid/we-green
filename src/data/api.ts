import type {
  AuthSession,
  AuthUser,
  Company,
  LoginFormValues,
  RegisterFormValues,
} from "../types";
import { clearAuthSession, loadAuthSession } from "./storage";

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = loadAuthSession()?.accessToken;
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, { ...options, headers });
  } catch {
    throw new ApiError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.", 0);
  }

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!response.ok) {
    if (response.status === 401 && token) {
      clearAuthSession();
    }
    throw new ApiError(
      body.error?.message ?? "요청을 처리하지 못했습니다.",
      response.status,
      body.error?.fields,
    );
  }
  return body;
}

export async function loginWithApi(
  values: LoginFormValues,
): Promise<AuthSession> {
  const response = await apiRequest<{ data: AuthSession }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
  return response.data;
}

export async function getCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
  const response = await apiRequest<{ data: { user: AuthUser } }>("/auth/me", {
    signal,
  });
  return response.data.user;
}

export async function getCompanies(): Promise<Company[]> {
  const response = await apiRequest<{ data: { companies: Company[] } }>(
    "/companies",
  );
  return response.data.companies;
}

export async function createCompanyWithApi(
  values: RegisterFormValues,
): Promise<Company> {
  const response = await apiRequest<{ data: { company: Company } }>(
    "/companies",
    { method: "POST", body: JSON.stringify(values) },
  );
  return response.data.company;
}
