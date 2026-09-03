import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.ts";
import { CompanyRepository } from "./company-repository.ts";
import { config } from "./config.ts";
import { SEED_COMPANIES } from "./data/seed-companies.ts";
import { createTempDataFilePath, removeDataFile } from "./test-utils.ts";

// 각 테스트마다 완전히 독립된 데이터 파일을 쓰는 저장소로 앱을 새로 만든다.
let app: ReturnType<typeof createApp>;
let dataFile: string;

beforeEach(() => {
  dataFile = createTempDataFilePath();
  app = createApp(new CompanyRepository(dataFile));
});
afterEach(() => removeDataFile(dataFile));

async function login() {
  const response = await request(app).post("/api/auth/login").send({
    email: config.demoUser.email,
    password: config.demoUser.password,
    name: "테스트 파트너",
  });
  return response.body.data.accessToken as string;
}

const validRegistration = {
  companyName: "테스트 조경",
  businessType: "개인사업자",
  introduction: "API 테스트를 위해 20자 이상 작성한 소개 문구입니다.",
  region: "서울",
  specialties: ["식재 디자인"],
  career: "5",
  managerName: "김담당",
  email: config.demoUser.email,
  agreement: true,
};

describe("GET /api/health", () => {
  it("responds ok", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: "ok" } });
  });
});

describe("POST /api/auth/login", () => {
  it("issues a token for the demo account", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: config.demoUser.email,
      password: config.demoUser.password,
      name: "파트너",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(config.demoUser.email);
    expect(typeof response.body.data.accessToken).toBe("string");
  });

  it("rejects an incorrect password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: config.demoUser.email,
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects a malformed email with a validation error", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "green1234",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/auth/me", () => {
  it("rejects a request without a token", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTH_REQUIRED");
  });

  it("rejects an invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_TOKEN");
  });

  it("returns the current user for a valid token", async () => {
    const token = await login();
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(config.demoUser.email);
  });
});

describe("GET /api/companies", () => {
  it("returns the seeded company list", async () => {
    const response = await request(app).get("/api/companies");
    expect(response.status).toBe(200);
    expect(response.body.data.companies).toHaveLength(SEED_COMPANIES.length);
  });

  it("filters by region", async () => {
    const response = await request(app).get("/api/companies?region=인천");
    expect(response.status).toBe(200);
    const companies = response.body.data.companies as { region: string }[];
    expect(companies.length).toBeGreaterThan(0);
    expect(companies.every((company) => company.region === "인천")).toBe(true);
  });

  it("filters by specialty", async () => {
    const response = await request(app).get(
      "/api/companies?specialty=정원 유지관리",
    );
    expect(response.status).toBe(200);
    const companies = response.body.data.companies as { specialties: string[] }[];
    expect(
      companies.every((company) => company.specialties.includes("정원 유지관리")),
    ).toBe(true);
  });
});

describe("GET /api/companies/:id", () => {
  it("returns a single company", async () => {
    const seeded = SEED_COMPANIES[0];
    const response = await request(app).get(`/api/companies/${seeded.id}`);
    expect(response.status).toBe(200);
    expect(response.body.data.company.name).toBe(seeded.name);
  });

  it("returns 404 for an unknown id", async () => {
    const response = await request(app).get("/api/companies/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("COMPANY_NOT_FOUND");
  });
});

describe("POST /api/companies", () => {
  it("rejects a request without a token", async () => {
    const response = await request(app)
      .post("/api/companies")
      .send(validRegistration);
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTH_REQUIRED");
  });

  it("rejects an invalid body with field-level messages", async () => {
    const token = await login();
    const response = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.fields.companyName).toBeTruthy();
    expect(response.body.error.fields.agreement).toBeTruthy();
  });

  it("creates a company and makes it available in the list", async () => {
    const token = await login();
    const createResponse = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${token}`)
      .send(validRegistration);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.company.name).toBe(
      validRegistration.companyName,
    );
    expect(createResponse.body.data.company.status).toBe("검토 중");
    expect(createResponse.body.data.company.isUserRegistered).toBe(true);

    const listResponse = await request(app).get("/api/companies");
    expect(listResponse.body.data.companies).toHaveLength(
      SEED_COMPANIES.length + 1,
    );
    expect(listResponse.body.data.companies[0].name).toBe(
      validRegistration.companyName,
    );
  });
});

describe("unmatched routes", () => {
  it("returns 404 NOT_FOUND for unknown /api/* paths", async () => {
    const response = await request(app).get("/api/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});
