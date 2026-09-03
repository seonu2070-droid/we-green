import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import { SignJWT } from "jose";
import {
  createAccessToken,
  requireAuth,
  verifyAccessToken,
  type AuthenticatedRequest,
} from "./auth.ts";
import type { AuthUser } from "./types.ts";

const user: AuthUser = {
  email: "partner@wegreen.test",
  name: "WE:GREEN 파트너",
  loggedInAt: "2026-01-01T00:00:00.000Z",
};

function mockResponse() {
  const response = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(payload: unknown) {
      response.body = payload;
      return response;
    },
  };
  return response as unknown as Response & typeof response;
}

function mockRequest(header?: string): AuthenticatedRequest {
  return {
    header: (name: string) =>
      name.toLowerCase() === "authorization" ? header : undefined,
  } as unknown as AuthenticatedRequest;
}

describe("createAccessToken / verifyAccessToken", () => {
  it("round-trips the user through a signed token", async () => {
    const token = await createAccessToken(user);
    const verified = await verifyAccessToken(token);
    expect(verified).toEqual(user);
  });

  it("rejects a tampered token", async () => {
    const token = await createAccessToken(user);
    await expect(verifyAccessToken(`${token}tampered`)).rejects.toThrow();
  });

  it("rejects a token signed with a different secret", async () => {
    const otherSecret = new TextEncoder().encode("a-different-secret-entirely");
    const token = await new SignJWT({
      name: user.name,
      loggedInAt: user.loggedInAt,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.email)
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(otherSecret);

    await expect(verifyAccessToken(token)).rejects.toThrow();
  });
});

describe("requireAuth", () => {
  it("responds 401 AUTH_REQUIRED when the header is missing", async () => {
    const request = mockRequest(undefined);
    const response = mockResponse();
    const next = vi.fn();

    await requireAuth(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({ error: { code: "AUTH_REQUIRED" } });
  });

  it("responds 401 INVALID_TOKEN for a malformed bearer token", async () => {
    const request = mockRequest("Bearer not-a-real-token");
    const response = mockResponse();
    const next = vi.fn();

    await requireAuth(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({ error: { code: "INVALID_TOKEN" } });
  });

  it("calls next and attaches authUser for a valid token", async () => {
    const token = await createAccessToken(user);
    const request = mockRequest(`Bearer ${token}`);
    const response = mockResponse();
    const next = vi.fn();

    await requireAuth(request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(request.authUser).toEqual(user);
  });
});
