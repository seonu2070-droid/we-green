import type { AuthUser, Company } from "../types";

const AUTH_KEY = "wegreen:auth";
const COMPANIES_KEY = "wegreen:user-companies";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadAuthUser(): AuthUser | null {
  return safeParse<AuthUser>(localStorage.getItem(AUTH_KEY));
}

export function saveAuthUser(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function loadUserCompanies(): Company[] {
  const parsed = safeParse<Company[]>(localStorage.getItem(COMPANIES_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

export function saveUserCompanies(companies: Company[]): void {
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
}

export function appendUserCompany(company: Company): Company[] {
  const next = [company, ...loadUserCompanies()];
  saveUserCompanies(next);
  return next;
}
