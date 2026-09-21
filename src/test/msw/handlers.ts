import { http, HttpResponse } from "msw";
import { DEMO_USER, FAKE_ACCESS_TOKEN, FIXTURE_COMPANIES } from "./fixtures";

function requireBearerToken(request: Request): boolean {
  const header = request.headers.get("authorization");
  return header === `Bearer ${FAKE_ACCESS_TOKEN}`;
}

export const handlers = [
  http.get("/api/health", () => HttpResponse.json({ data: { status: "ok" } })),

  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (body.email !== DEMO_USER.email || body.password !== DEMO_USER.password) {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "이메일 또는 비밀번호가 올바르지 않습니다.",
          },
        },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      data: {
        user: {
          email: DEMO_USER.email,
          name: body.name || DEMO_USER.name,
          loggedInAt: new Date().toISOString(),
        },
        accessToken: FAKE_ACCESS_TOKEN,
      },
    });
  }),

  http.get("/api/auth/me", ({ request }) => {
    if (!requireBearerToken(request)) {
      return HttpResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "로그인이 필요합니다." } },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      data: {
        user: {
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          loggedInAt: new Date().toISOString(),
        },
      },
    });
  }),

  http.get("/api/companies", ({ request }) => {
    const url = new URL(request.url);
    const region = url.searchParams.get("region");
    const specialty = url.searchParams.get("specialty");
    const companies = FIXTURE_COMPANIES.filter(
      (company) =>
        (!region || region === "all" || company.region === region) &&
        (!specialty ||
          specialty === "all" ||
          company.specialties.includes(specialty)),
    );
    return HttpResponse.json({ data: { companies } });
  }),

  http.get("/api/companies/:id", ({ params }) => {
    const company = FIXTURE_COMPANIES.find((item) => item.id === params.id);
    if (!company) {
      return HttpResponse.json(
        {
          error: {
            code: "COMPANY_NOT_FOUND",
            message: "업체를 찾을 수 없습니다.",
          },
        },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: { company } });
  }),

  http.post("/api/companies", async ({ request }) => {
    if (!requireBearerToken(request)) {
      return HttpResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "로그인이 필요합니다." } },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { companyName?: string };
    return HttpResponse.json(
      {
        data: {
          company: {
            ...FIXTURE_COMPANIES[0],
            id: "new-company",
            name: body.companyName ?? "새 업체",
            status: "검토 중",
            isUserRegistered: true,
            createdAt: new Date().toISOString(),
          },
        },
      },
      { status: 201 },
    );
  }),

  http.post("/api/recommend", async ({ request }) => {
    const body = (await request.json()) as { message?: string };
    if (!body.message || body.message.trim().length < 5) {
      return HttpResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "입력값을 확인해 주세요.",
            fields: { message: "5자 이상 입력해 주세요." },
          },
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      data: {
        recommendations: [
          { company: FIXTURE_COMPANIES[0], reason: "테스트 추천 이유입니다." },
        ],
      },
    });
  }),
];
