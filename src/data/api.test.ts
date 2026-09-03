import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { mswServer } from "../test/msw/server";
import { DEMO_USER, FAKE_ACCESS_TOKEN } from "../test/msw/fixtures";
import { saveAuthSession, loadAuthSession } from "./storage";
import {
  ApiError,
  createCompanyWithApi,
  getCompanies,
  getCurrentUser,
  loginWithApi,
} from "./api";
import type { RegisterFormValues } from "../types";

beforeEach(() => {
  localStorage.clear();
});

describe("loginWithApi", () => {
  it("returns a session on success", async () => {
    const session = await loginWithApi({
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      name: "파트너",
    });
    expect(session.accessToken).toBe(FAKE_ACCESS_TOKEN);
    expect(session.user.email).toBe(DEMO_USER.email);
  });

  it("throws ApiError with the server message on invalid credentials", async () => {
    await expect(
      loginWithApi({ email: DEMO_USER.email, password: "wrong", name: "" }),
    ).rejects.toMatchObject({
      status: 401,
      message: "이메일 또는 비밀번호가 올바르지 않습니다.",
    });
  });
});

describe("getCompanies", () => {
  it("returns the company list", async () => {
    const companies = await getCompanies();
    expect(companies.length).toBeGreaterThan(0);
  });

  it("surfaces a connection error as ApiError with status 0", async () => {
    mswServer.use(
      http.get("/api/companies", () => HttpResponse.error()),
    );
    await expect(getCompanies()).rejects.toMatchObject({ status: 0 });
  });
});

describe("getCurrentUser", () => {
  it("throws AUTH_REQUIRED style ApiError without a stored session", async () => {
    await expect(getCurrentUser()).rejects.toMatchObject({ status: 401 });
  });

  it("attaches the stored access token as a Bearer header", async () => {
    saveAuthSession({
      user: { email: DEMO_USER.email, name: DEMO_USER.name, loggedInAt: "" },
      accessToken: FAKE_ACCESS_TOKEN,
    });
    const user = await getCurrentUser();
    expect(user.email).toBe(DEMO_USER.email);
  });

  it("clears the stored session when the server rejects the token as 401", async () => {
    saveAuthSession({
      user: { email: DEMO_USER.email, name: DEMO_USER.name, loggedInAt: "" },
      accessToken: "stale-token",
    });
    await expect(getCurrentUser()).rejects.toThrow(ApiError);
    expect(loadAuthSession()).toBeNull();
  });
});

describe("createCompanyWithApi", () => {
  const values: RegisterFormValues = {
    companyName: "새 조경",
    businessType: "개인사업자",
    introduction: "20자 이상 작성된 소개 문구입니다 테스트용입니다.",
    region: "서울",
    specialties: ["식재 디자인"],
    career: "3",
    managerName: "김담당",
    email: "new@example.com",
    agreement: true,
  };

  it("requires authentication", async () => {
    await expect(createCompanyWithApi(values)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("creates a company when authenticated", async () => {
    saveAuthSession({
      user: { email: DEMO_USER.email, name: DEMO_USER.name, loggedInAt: "" },
      accessToken: FAKE_ACCESS_TOKEN,
    });
    const company = await createCompanyWithApi(values);
    expect(company.name).toBe(values.companyName);
    expect(company.isUserRegistered).toBe(true);
  });
});
