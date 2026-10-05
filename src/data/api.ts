import type {
  AuthSession,
  AuthUser,
  Company,
  LoginFormValues,
  Recommendation,
  RegisterFormValues,
} from "../types";
import {
  isArrayOf,
  isAuthSession,
  isAuthUser,
  isCompany,
  isRecommendation,
  isRecord,
  parseErrorBody,
} from "./guards";
import { clearAuthSession, loadAuthSession } from "./storage";

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

const INVALID_RESPONSE_MESSAGE = "서버 응답 형식이 올바르지 않습니다.";

/** 응답의 `data` 필드를 꺼내 guard로 검증합니다. 실패하면 ApiError를 던집니다. */
async function apiRequest<T>(
  path: string,
  parseData: (data: unknown) => T | undefined,
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

  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      clearAuthSession();
    }
    const { message, fields } = parseErrorBody(body);
    throw new ApiError(
      message ?? "요청을 처리하지 못했습니다.",
      response.status,
      fields,
    );
  }

  const data = isRecord(body) ? parseData(body.data) : undefined;
  if (data === undefined) {
    throw new ApiError(INVALID_RESPONSE_MESSAGE, response.status);
  }
  return data;
}

export async function loginWithApi(
  values: LoginFormValues,
): Promise<AuthSession> {
  return apiRequest(
    "/auth/login",
    (data) => (isAuthSession(data) ? data : undefined),
    { method: "POST", body: JSON.stringify(values) },
  );
}

export async function getCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
  return apiRequest(
    "/auth/me",
    (data) => (isRecord(data) && isAuthUser(data.user) ? data.user : undefined),
    { signal },
  );
}

export async function getCompanies(): Promise<Company[]> {
  return apiRequest("/companies", (data) =>
    isRecord(data) && isArrayOf(data.companies, isCompany)
      ? data.companies
      : undefined,
  );
}

export async function createCompanyWithApi(
  values: RegisterFormValues,
): Promise<Company> {
  return apiRequest(
    "/companies",
    (data) => (isRecord(data) && isCompany(data.company) ? data.company : undefined),
    { method: "POST", body: JSON.stringify(values) },
  );
}

export async function getRecommendations(
  message: string,
): Promise<Recommendation[]> {
  return apiRequest(
    "/recommend",
    (data) =>
      isRecord(data) && isArrayOf(data.recommendations, isRecommendation)
        ? data.recommendations
        : undefined,
    { method: "POST", body: JSON.stringify({ message }) },
  );
}
