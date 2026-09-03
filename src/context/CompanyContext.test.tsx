import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { act, renderHook, waitFor } from "@testing-library/react";
import { mswServer } from "../test/msw/server";
import { DEMO_USER, FAKE_ACCESS_TOKEN, FIXTURE_COMPANIES } from "../test/msw/fixtures";
import { CompanyProvider, useCompanies } from "./CompanyContext";
import { saveAuthSession } from "../data/storage";
import type { RegisterFormValues } from "../types";

function wrapper({ children }: { children: ReactNode }) {
  return <CompanyProvider>{children}</CompanyProvider>;
}

const registration: RegisterFormValues = {
  companyName: "새 조경",
  businessType: "개인사업자",
  introduction: "새로 등록하는 조경업체의 20자 이상 소개 문구입니다.",
  region: "서울",
  specialties: ["식재 디자인"],
  career: "3",
  managerName: "김담당",
  email: "new@example.com",
  agreement: true,
};

beforeEach(() => {
  localStorage.clear();
});

describe("CompanyContext", () => {
  it("loads companies from the API on mount", async () => {
    const { result } = renderHook(() => useCompanies(), { wrapper });
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.companies).toHaveLength(FIXTURE_COMPANIES.length);
    expect(result.current.error).toBe("");
  });

  it("exposes an error and empty list when the request fails", async () => {
    mswServer.use(
      http.get("/api/companies", () =>
        HttpResponse.json(
          { error: { code: "INTERNAL_SERVER_ERROR", message: "서버 오류가 발생했습니다." } },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("서버 오류가 발생했습니다.");
    expect(result.current.companies).toEqual([]);
  });

  it("recovers after reloadCompanies retries successfully", async () => {
    mswServer.use(
      http.get("/api/companies", () => HttpResponse.error(), { once: true }),
    );

    const { result } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.error).not.toBe(""));

    await act(async () => {
      await result.current.reloadCompanies();
    });

    expect(result.current.error).toBe("");
    expect(result.current.companies).toHaveLength(FIXTURE_COMPANIES.length);
  });

  it("finds a company by id", async () => {
    const { result } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const first = FIXTURE_COMPANIES[0];
    expect(result.current.getCompanyById(first.id)?.name).toBe(first.name);
    expect(result.current.getCompanyById("missing")).toBeUndefined();
  });

  it("filters companies through filterCompanies", async () => {
    const { result } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const filtered = result.current.filterCompanies({
      region: "인천",
      specialty: "all",
    });
    expect(filtered.every((company) => company.region === "인천")).toBe(true);
  });

  it("registers a new company and prepends it to the list", async () => {
    saveAuthSession({
      user: { email: DEMO_USER.email, name: DEMO_USER.name, loggedInAt: "" },
      accessToken: FAKE_ACCESS_TOKEN,
    });

    const { result } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const initialCount = result.current.companies.length;

    let created: Awaited<ReturnType<typeof result.current.registerCompany>> | undefined;
    await act(async () => {
      created = await result.current.registerCompany(registration);
    });

    expect(result.current.companies.length).toBe(initialCount + 1);
    expect(result.current.companies[0].id).toBe(created?.id);
    expect(result.current.companies[0].name).toBe(registration.companyName);
  });

  it("rejects registration without a valid session", async () => {
    const { result } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      act(async () => {
        await result.current.registerCompany(registration);
      }),
    ).rejects.toThrow();
  });
});
