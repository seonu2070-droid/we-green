import { describe, expect, it } from "vitest";
import type { LoginFormValues, RegisterFormValues } from "../types";
import {
  validateEmail,
  validateLoginForm,
  validateRegisterForm,
} from "./validation";

describe("validateEmail", () => {
  it("rejects an empty email", () => {
    expect(validateEmail("")).toBe("필수 항목을 입력해 주세요.");
    expect(validateEmail("   ")).toBe("필수 항목을 입력해 주세요.");
  });

  it("rejects a malformed email", () => {
    expect(validateEmail("not-an-email")).toBe(
      "올바른 이메일 형식으로 입력해 주세요.",
    );
  });

  it("accepts a well-formed email", () => {
    expect(validateEmail("user@example.com")).toBe("");
  });
});

describe("validateLoginForm", () => {
  const validValues: LoginFormValues = {
    email: "user@example.com",
    password: "1234",
    name: "홍길동",
  };

  it("returns no errors for valid values", () => {
    expect(validateLoginForm(validValues)).toEqual({});
  });

  it("reports a login-specific message for a missing email", () => {
    const errors = validateLoginForm({ ...validValues, email: "" });
    expect(errors.email).toBe("이메일을 입력해 주세요.");
  });

  it("reports a format error for an invalid email", () => {
    const errors = validateLoginForm({ ...validValues, email: "bad" });
    expect(errors.email).toBe("올바른 이메일 형식으로 입력해 주세요.");
  });

  it("requires a password", () => {
    const errors = validateLoginForm({ ...validValues, password: "" });
    expect(errors.password).toBe("비밀번호를 입력해 주세요.");
  });

  it("requires a password of at least 4 characters", () => {
    const errors = validateLoginForm({ ...validValues, password: "123" });
    expect(errors.password).toBe("비밀번호는 4자 이상 입력해 주세요.");
  });
});

describe("validateRegisterForm", () => {
  const validValues: RegisterFormValues = {
    companyName: "WE 조경",
    businessType: "개인사업자",
    introduction: "20자 이상 작성된 소개 문구입니다 테스트용",
    region: "경기",
    specialties: ["주택 정원 조성"],
    career: "5",
    managerName: "홍길동",
    email: "user@example.com",
    agreement: true,
  };

  it("returns no errors for valid values", () => {
    expect(validateRegisterForm(validValues)).toEqual({});
  });

  it("requires companyName, businessType, region, managerName", () => {
    const errors = validateRegisterForm({
      ...validValues,
      companyName: "  ",
      businessType: "",
      region: "",
      managerName: "  ",
    });
    expect(errors.companyName).toBe("필수 항목을 입력해 주세요.");
    expect(errors.businessType).toBe("필수 항목을 입력해 주세요.");
    expect(errors.region).toBe("필수 항목을 입력해 주세요.");
    expect(errors.managerName).toBe("필수 항목을 입력해 주세요.");
  });

  it("requires an introduction of at least 20 characters", () => {
    const tooShort = validateRegisterForm({
      ...validValues,
      introduction: "짧은 소개",
    });
    expect(tooShort.introduction).toBe("20자 이상 입력해 주세요.");

    const empty = validateRegisterForm({ ...validValues, introduction: "" });
    expect(empty.introduction).toBe("필수 항목을 입력해 주세요.");
  });

  it("requires at least one specialty", () => {
    const errors = validateRegisterForm({ ...validValues, specialties: [] });
    expect(errors.specialties).toBe("전문 분야를 한 개 이상 선택해 주세요.");
  });

  it("requires agreement to be checked", () => {
    const errors = validateRegisterForm({ ...validValues, agreement: false });
    expect(errors.agreement).toBe("약관에 동의해 주세요.");
  });

  it("validates the email field", () => {
    const errors = validateRegisterForm({ ...validValues, email: "bad" });
    expect(errors.email).toBe("올바른 이메일 형식으로 입력해 주세요.");
  });
});
