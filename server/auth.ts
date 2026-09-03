import { SignJWT, jwtVerify } from "jose";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.ts";
import type { AuthUser } from "./types.ts";

const secret = new TextEncoder().encode(config.jwtSecret);

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
}

export async function createAccessToken(user: AuthUser): Promise<string> {
  return new SignJWT({ name: user.name, loggedInAt: user.loggedInAt })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AuthUser> {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  if (
    !payload.sub ||
    typeof payload.name !== "string" ||
    typeof payload.loggedInAt !== "string"
  ) {
    throw new Error("Invalid token payload.");
  }

  return {
    email: payload.sub,
    name: payload.name,
    loggedInAt: payload.loggedInAt,
  };
}

export async function requireAuth(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    response.status(401).json({
      error: { code: "AUTH_REQUIRED", message: "로그인이 필요합니다." },
    });
    return;
  }

  try {
    request.authUser = await verifyAccessToken(token);
    next();
  } catch {
    response.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
      },
    });
  }
}
