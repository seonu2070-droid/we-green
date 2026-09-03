import { describe, expect, it } from "vitest";
import {
  formatValidationErrors,
  loginSchema,
  registerCompanySchema,
} from "./schemas.ts";

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "partner@wegreen.test",
      password: "green1234",
      name: "파트너",
    });
    expect(result.success).toBe(true);
  });

  it("defaults name to an empty string when omitted", () => {
    const result = loginSchema.parse({
      email: "partner@wegreen.test",
      password: "green1234",
    });
    expect(result.name).toBe("");
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "green1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 4 characters", () => {
    const result = loginSchema.safeParse({
      email: "partner@wegreen.test",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerCompanySchema", () => {
  const validInput = {
    companyName: "WE 조경",
    businessType: "개인사업자",
    introduction: "지역의 환경과 생활 동선을 고려해 오래가는 정원을 만듭니다.",
    region: "경기",
    specialties: ["주택 정원 조성"],
    career: "8",
    managerName: "홍길동",
    email: "partner@wegreen.test",
    agreement: true,
  };

  it("accepts a fully valid payload", () => {
    const result = registerCompanySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("requires an introduction of at least 20 characters", () => {
    const result = registerCompanySchema.safeParse({
      ...validInput,
      introduction: "짧은 소개",
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one specialty", () => {
    const result = registerCompanySchema.safeParse({
      ...validInput,
      specialties: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an empty career string", () => {
    const result = registerCompanySchema.safeParse({
      ...validInput,
      career: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-numeric career", () => {
    const result = registerCompanySchema.safeParse({
      ...validInput,
      career: "여덟",
    });
    expect(result.success).toBe(false);
  });

  it("requires agreement to be exactly true", () => {
    const result = registerCompanySchema.safeParse({
      ...validInput,
      agreement: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("formatValidationErrors", () => {
  it("maps each issue path to its message", () => {
    const result = registerCompanySchema.safeParse({});
    if (result.success) throw new Error("expected validation to fail");

    const fields = formatValidationErrors(result.error);
    expect(fields.companyName).toBeTruthy();
    expect(fields.agreement).toBeTruthy();
    expect(Object.keys(fields)).toContain("email");
  });
});
