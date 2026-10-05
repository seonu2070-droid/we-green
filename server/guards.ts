import type { Company } from "./types.ts";

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

export function isCompany(value: unknown): value is Company {
  return (
    isRecord(value) &&
    COMPANY_STRING_FIELDS.every((field) => typeof value[field] === "string") &&
    COMPANY_STRING_ARRAY_FIELDS.every((field) => isStringArray(value[field])) &&
    (value.isUserRegistered === undefined ||
      typeof value.isUserRegistered === "boolean") &&
    (value.createdAt === undefined || typeof value.createdAt === "string")
  );
}
