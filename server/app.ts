import { resolve } from "node:path";
import cors from "cors";
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import { ZodError } from "zod";
import {
  createAccessToken,
  requireAuth,
  type AuthenticatedRequest,
} from "./auth.ts";
import { createCompany } from "./company-mapper.ts";
import { CompanyRepository } from "./company-repository.ts";
import { config } from "./config.ts";
import {
  RecommendationServiceUnavailableError,
  RecommendationUpstreamError,
  getCompanyRecommendations,
} from "./openai.ts";
import {
  formatValidationErrors,
  loginSchema,
  recommendSchema,
  registerCompanySchema,
} from "./schemas.ts";
import type { AuthUser } from "./types.ts";

export function createApp(repository = new CompanyRepository()) {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("허용되지 않은 출처입니다."));
      },
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ data: { status: "ok" } });
  });

  app.post("/api/auth/login", async (request, response) => {
    const input = loginSchema.parse(request.body);
    const isValidAccount =
      input.email.toLowerCase() === config.demoUser.email.toLowerCase() &&
      input.password === config.demoUser.password;

    if (!isValidAccount) {
      response.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        },
      });
      return;
    }

    const user: AuthUser = {
      email: config.demoUser.email,
      name: input.name || config.demoUser.name,
      loggedInAt: new Date().toISOString(),
    };
    const accessToken = await createAccessToken(user);
    response.json({ data: { user, accessToken } });
  });

  app.get(
    "/api/auth/me",
    requireAuth,
    (request: AuthenticatedRequest, response) => {
      response.json({ data: { user: request.authUser } });
    },
  );

  app.get("/api/companies", async (request, response) => {
    const region = typeof request.query.region === "string" ? request.query.region : "";
    const specialty =
      typeof request.query.specialty === "string" ? request.query.specialty : "";
    const companies = await repository.findAll();
    const filteredCompanies = companies.filter(
      (company) =>
        (!region || region === "all" || company.region === region) &&
        (!specialty ||
          specialty === "all" ||
          company.specialties.includes(specialty)),
    );
    response.json({ data: { companies: filteredCompanies } });
  });

  app.get("/api/companies/:id", async (request, response) => {
    const company = await repository.findById(request.params.id);
    if (!company) {
      response.status(404).json({
        error: { code: "COMPANY_NOT_FOUND", message: "업체를 찾을 수 없습니다." },
      });
      return;
    }
    response.json({ data: { company } });
  });

  app.post(
    "/api/companies",
    requireAuth,
    async (request: AuthenticatedRequest, response) => {
      const input = registerCompanySchema.parse(request.body);
      const company = createCompany(input);
      await repository.create(company);
      response.status(201).json({ data: { company } });
    },
  );

  app.post("/api/recommend", async (request, response) => {
    const input = recommendSchema.parse(request.body);
    const companies = await repository.findAll();

    try {
      const recommendations = await getCompanyRecommendations(
        input.message,
        companies,
      );
      const companyById = new Map(companies.map((company) => [company.id, company]));
      response.json({
        data: {
          recommendations: recommendations.map((recommendation) => ({
            company: companyById.get(recommendation.companyId),
            reason: recommendation.reason,
          })),
        },
      });
    } catch (error) {
      if (error instanceof RecommendationServiceUnavailableError) {
        response.status(503).json({
          error: { code: "AI_UNAVAILABLE", message: error.message },
        });
        return;
      }
      if (error instanceof RecommendationUpstreamError) {
        response.status(502).json({
          error: { code: "AI_UPSTREAM_ERROR", message: error.message },
        });
        return;
      }
      throw error;
    }
  });

  app.use("/api", (_request, response) => {
    response.status(404).json({
      error: { code: "NOT_FOUND", message: "요청한 API를 찾을 수 없습니다." },
    });
  });

  const webRoot = resolve(process.cwd(), "dist");
  app.use(express.static(webRoot));
  app.use((request: Request, response: Response, next) => {
    if (request.method === "GET" && request.accepts("html")) {
      response.sendFile(resolve(webRoot, "index.html"), (error) => {
        if (error) next(error);
      });
      return;
    }
    next();
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "입력값을 확인해 주세요.",
          fields: formatValidationErrors(error),
        },
      });
      return;
    }

    if (
      error instanceof SyntaxError &&
      "status" in error &&
      error.status === 400 &&
      "body" in error
    ) {
      response.status(400).json({
        error: {
          code: "INVALID_JSON",
          message: "JSON 요청 형식이 올바르지 않습니다.",
        },
      });
      return;
    }

    console.error(error);
    response.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
    });
  };
  app.use(errorHandler);

  return app;
}
