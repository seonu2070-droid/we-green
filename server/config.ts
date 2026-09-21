import { resolve } from "node:path";

function parseAllowedOrigins(value: string | undefined): string[] {
  return (value ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET ?? "development-only-change-this-secret";

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production.");
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  jwtSecret,
  dataFile: resolve(
    process.cwd(),
    process.env.DATA_FILE ?? "server/data/companies.json",
  ),
  demoUser: {
    email: process.env.DEMO_USER_EMAIL ?? "partner@wegreen.test",
    password: process.env.DEMO_USER_PASSWORD ?? "green1234",
    name: process.env.DEMO_USER_NAME ?? "WE:GREEN 파트너",
  },
  openaiApiKey: process.env.OPENAI_API_KEY,
} as const;
