import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { CompanyProvider, useCompanies } from "./CompanyContext";
import { MOCK_COMPANIES } from "../data/companies";
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
  it("exposes the mock companies by default", () => {
    const { result } = renderHook(() => useCompanies(), { wrapper });
    expect(result.current.companies).toHaveLength(MOCK_COMPANIES.length);
  });

  it("finds a company by id", () => {
    const { result } = renderHook(() => useCompanies(), { wrapper });
    const first = MOCK_COMPANIES[0];
    expect(result.current.getCompanyById(first.id)?.name).toBe(first.name);
    expect(result.current.getCompanyById("missing")).toBeUndefined();
  });

  it("filters companies through filterCompanies", () => {
    const { result } = renderHook(() => useCompanies(), { wrapper });
    const filtered = result.current.filterCompanies({
      region: "인천",
      specialty: "all",
    });
    expect(filtered.every((company) => company.region === "인천")).toBe(true);
  });

  it("registers a new company and prepends it to the list", async () => {
    const { result } = renderHook(() => useCompanies(), { wrapper });
    const initialCount = result.current.companies.length;

    let created: Awaited<ReturnType<typeof result.current.registerCompany>> | undefined;
    await act(async () => {
      created = await result.current.registerCompany(registration);
    });

    await waitFor(() =>
      expect(result.current.companies.length).toBe(initialCount + 1),
    );
    expect(result.current.companies[0].id).toBe(created?.id);
    expect(result.current.companies[0].name).toBe(registration.companyName);
    expect(result.current.getCompanyById(created!.id)).toBeDefined();
  });

  it("toggles isRegistering while a registration is in flight", async () => {
    const { result } = renderHook(() => useCompanies(), { wrapper });
    expect(result.current.isRegistering).toBe(false);

    let pending: Promise<unknown>;
    act(() => {
      pending = result.current.registerCompany(registration);
    });

    await waitFor(() => expect(result.current.isRegistering).toBe(true));
    await act(async () => {
      await pending;
    });
    expect(result.current.isRegistering).toBe(false);
  });
});
