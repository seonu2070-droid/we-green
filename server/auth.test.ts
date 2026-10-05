import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
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

function createTestApp() {
  const app = express();
  app.get("/protected", requireAuth, (request: AuthenticatedRequest, response) => {
    response.json({ authUser: request.authUser });
  });
  return app;
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
    const response = await request(createTestApp()).get("/protected");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: { code: "AUTH_REQUIRED" } });
  });

  it("responds 401 INVALID_TOKEN for a malformed bearer token", async () => {
    const response = await request(createTestApp())
      .get("/protected")
      .set("Authorization", "Bearer not-a-real-token");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: { code: "INVALID_TOKEN" } });
  });

  it("calls next and attaches authUser for a valid token", async () => {
    const token = await createAccessToken(user);
    const response = await request(createTestApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authUser: user });
  });
});
