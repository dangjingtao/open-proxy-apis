// tests/middleware_auth_test.ts
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { describe, expect, it } from "vitest";
import { checkToken } from "../middlewares/auth.ts";
import type { AppEnv } from "../config/env.ts";

const TEST_JWT_SECRET = "test-jwt-secret";

const createValidToken = async () => {
  return await sign(
    {
      sub: "test-user",
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    TEST_JWT_SECRET,
  );
};

const app = new Hono<{ Bindings: AppEnv }>();

const fetchApp = (request: Request) => app.fetch(request);

// 应用中间件到所有 /api/* 路由，但排除 /api/login
app.use("*", (c, next) => {
  c.env = { JWT_SECRET: TEST_JWT_SECRET };
  return next();
});
app.use("/api/*", checkToken);

app.get("/api/status", (c) => c.json({ status: "ok" }));
app.post("/api/login", (c) => c.json({ status: "ok" }));

describe("authentication middleware", () => {
  it("allows access to /api/login without x-token", async () => {
    const request = new Request("http://localhost/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationCode: "test" }),
    });
    const response = await fetchApp(request);
    expect(response.status).toBe(200);
  });

  it("denies access to /api/status without x-token", async () => {
    const request = new Request("http://localhost/api/status", {
      method: "GET",
    });
    const response = await fetchApp(request);
    expect(response.status).toBe(401);
  });

  it("allows access to /api/status with valid Bearer token", async () => {
    const token = await createValidToken();
    const request = new Request("http://localhost/api/status", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await fetchApp(request);
    expect(response.status).toBe(200);
  });

  it("denies access to /api/status with invalid Bearer token", async () => {
    const request = new Request("http://localhost/api/status", {
      method: "GET",
      headers: { Authorization: "Bearer invalid-token" },
    });
    const response = await fetchApp(request);
    expect(response.status).toBe(401);
  });

  it("denies access to /api/other without x-token", async () => {
    const request = new Request("http://localhost/api/other", {
      method: "GET",
    });
    const response = await fetchApp(request);
    expect(response.status).toBe(401);
  });

  it("denies access when the JWT secret is not configured", async () => {
    const request = new Request("http://localhost/api/status", {
      method: "GET",
      headers: { Authorization: "Bearer any-token" },
    });
    const response = await app.fetch(request, undefined, {});
    expect(response.status).toBe(401);
  });

  it("passes auth and returns 404 for /api/other with valid Bearer token", async () => {
    const token = await createValidToken();
    const request = new Request("http://localhost/api/other", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await fetchApp(request);
    expect(response.status).toBe(404);
  });

  it("allows access to /api/login with token header", async () => {
    const token = await createValidToken();
    const request = new Request("http://localhost/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invitationCode: "test" }),
    });
    const response = await fetchApp(request);
    expect(response.status).toBe(200);
  });
});
