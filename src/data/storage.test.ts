import { beforeEach, describe, expect, it } from "vitest";
import type { AuthUser, Company } from "../types";
import {
  appendUserCompany,
  clearAuthUser,
  loadAuthUser,
  loadUserCompanies,
  saveAuthUser,
  saveUserCompanies,
} from "./storage";

const user: AuthUser = {
  email: "user@example.com",
  name: "홍길동",
  loggedInAt: "2026-01-01T00:00:00.000Z",
};

function makeCompany(id: string): Company {
  return {
    id,
    name: `${id} 조경`,
    location: "경기",
    region: "경기",
    category: "주택 정원 조성",
    specialties: ["주택 정원 조성"],
    tagline: "tagline",
    area: "경기",
    address: "경기",
    phone: "031-000-0000",
    career: "5년",
    caseCount: "대표 사례 5건",
    status: "검토 중",
    image: "/assets/images/company-1.webp",
    description: "description",
    gallery: [],
    services: ["주택 정원 조성"],
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("auth storage", () => {
  it("returns null when nothing is stored", () => {
    expect(loadAuthUser()).toBeNull();
  });

  it("saves and loads the auth user", () => {
    saveAuthUser(user);
    expect(loadAuthUser()).toEqual(user);
  });

  it("clears the auth user", () => {
    saveAuthUser(user);
    clearAuthUser();
    expect(loadAuthUser()).toBeNull();
  });

  it("returns null for corrupted JSON", () => {
    localStorage.setItem("wegreen:auth", "{not-json");
    expect(loadAuthUser()).toBeNull();
  });
});

describe("user companies storage", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(loadUserCompanies()).toEqual([]);
  });

  it("returns an empty array for non-array JSON", () => {
    localStorage.setItem("wegreen:user-companies", JSON.stringify({ a: 1 }));
    expect(loadUserCompanies()).toEqual([]);
  });

  it("saves and loads user companies", () => {
    const companies = [makeCompany("a"), makeCompany("b")];
    saveUserCompanies(companies);
    expect(loadUserCompanies()).toEqual(companies);
  });

  it("prepends a new company and persists it", () => {
    saveUserCompanies([makeCompany("existing")]);
    const result = appendUserCompany(makeCompany("new"));

    expect(result.map((c) => c.id)).toEqual(["new", "existing"]);
    expect(loadUserCompanies().map((c) => c.id)).toEqual(["new", "existing"]);
  });
});
