import type { AuthSession, AuthUser, Company, Recommendation } from "../types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

const COMPANY_STRING_FIELDS = [
  "id",
  "name",
  "location",
  "region",
  "category",
  "tagline",
  "area",
  "address",
  "phone",
  "career",
  "caseCount",
  "status",
  "image",
  "description",
] as const;

const COMPANY_STRING_ARRAY_FIELDS = ["specialties", "gallery", "services"] as const;

export function isAuthUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    typeof value.email === "string" &&
    typeof value.name === "string" &&
    typeof value.loggedInAt === "string"
  );
}

export function isAuthSession(value: unknown): value is AuthSession {
  return (
    isRecord(value) &&
    typeof value.accessToken === "string" &&
    isAuthUser(value.user)
  );
}

export function isCompany(value: unknown): value is Company {
  return (
    isRecord(value) &&
    COMPANY_STRING_FIELDS.every((field) => typeof value[field] === "string") &&
    COMPANY_STRING_ARRAY_FIELDS.every((field) => isStringArray(value[field])) &&
    (value.isUserRegistered === undefined ||
      typeof value.isUserRegistered === "boolean")
  );
}

export function isRecommendation(value: unknown): value is Recommendation {
  return (
    isRecord(value) &&
    typeof value.reason === "string" &&
    isCompany(value.company)
  );
}

export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

export interface ParsedErrorBody {
  message?: string;
  fields?: Record<string, string>;
}

export function parseErrorBody(body: unknown): ParsedErrorBody {
  if (!isRecord(body) || !isRecord(body.error)) return {};
  const { message, fields } = body.error;
  return {
    message: typeof message === "string" ? message : undefined,
    fields: isRecord(fields)
      ? Object.fromEntries(
          Object.entries(fields).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : undefined,
  };
}
