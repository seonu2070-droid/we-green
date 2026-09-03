import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CompanyRepository } from "./company-repository.ts";
import { SEED_COMPANIES } from "./data/seed-companies.ts";
import { createTempDataFilePath, removeDataFile } from "./test-utils.ts";
import type { Company } from "./types.ts";

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

let dataFile: string;

beforeEach(() => {
  dataFile = createTempDataFilePath();
});

afterEach(() => removeDataFile(dataFile));

describe("CompanyRepository", () => {
  it("seeds the data file with SEED_COMPANIES on first read", async () => {
    const repository = new CompanyRepository(dataFile);
    const companies = await repository.findAll();
    expect(companies).toEqual(SEED_COMPANIES);
  });

  it("finds a seeded company by id and returns undefined for unknown ids", async () => {
    const repository = new CompanyRepository(dataFile);
    const seeded = SEED_COMPANIES[0];
    expect(await repository.findById(seeded.id)).toEqual(seeded);
    expect(await repository.findById("does-not-exist")).toBeUndefined();
  });

  it("prepends a created company and persists it for later reads", async () => {
    const repository = new CompanyRepository(dataFile);
    const created = makeCompany("new-1");
    await repository.create(created);

    const companies = await repository.findAll();
    expect(companies[0]).toEqual(created);
    expect(companies).toHaveLength(SEED_COMPANIES.length + 1);

    // 같은 파일을 가리키는 새 인스턴스로도 실제로 디스크에 기록되었는지 확인합니다.
    const freshRepository = new CompanyRepository(dataFile);
    expect(await freshRepository.findById("new-1")).toEqual(created);
  });

  it("serializes concurrent creates so no write is lost", async () => {
    const repository = new CompanyRepository(dataFile);
    await repository.findAll(); // 초기 시드 파일을 미리 생성해 둡니다.

    const concurrentCreates = Array.from({ length: 8 }, (_, index) =>
      repository.create(makeCompany(`concurrent-${index}`)),
    );
    await Promise.all(concurrentCreates);

    const companies = await repository.findAll();
    expect(companies).toHaveLength(SEED_COMPANIES.length + 8);
    for (let index = 0; index < 8; index += 1) {
      expect(
        companies.some((company) => company.id === `concurrent-${index}`),
      ).toBe(true);
    }
  });
});
