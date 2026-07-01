// tests/middleware_auth_test.ts
import { Hono } from "hono";
import { assertEquals } from "https://deno.land/std@0.110.0/testing/asserts.ts";
import { sign } from "hono/jwt";
import { checkToken } from "../middlewares/auth.ts";

const TEST_JWT_SECRET = "test-jwt-secret";
Deno.env.set("JWT_SECRET", TEST_JWT_SECRET);

const createValidToken = async () => {
  return await sign(
    {
      sub: "test-user",
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    TEST_JWT_SECRET,
  );
};

const app = new Hono();

// 应用中间件到所有 /api/* 路由，但排除 /api/login
app.use("/api/*", checkToken);

app.get("/api/status", (c) => c.json({ status: "ok" }));
app.post("/api/login", (c) => c.json({ status: "ok" }));

Deno.test("should allow access to /api/login without x-token", async () => {
  const request = new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invitationCode: "test" }),
  });
  const response = await app.fetch(request);
  assertEquals(response.status, 200);
});

Deno.test("should deny access to /api/status without x-token", async () => {
  const request = new Request("http://localhost/api/status", {
    method: "GET",
  });
  const response = await app.fetch(request);
  assertEquals(response.status, 401);
});

Deno.test(
  "should allow access to /api/status with valid Bearer token",
  async () => {
    const token = await createValidToken();
    const request = new Request("http://localhost/api/status", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await app.fetch(request);
    assertEquals(response.status, 200);
  },
);

Deno.test(
  "should deny access to /api/status with invalid Bearer token",
  async () => {
    const request = new Request("http://localhost/api/status", {
      method: "GET",
      headers: { Authorization: "Bearer invalid-token" },
    });
    const response = await app.fetch(request);
    assertEquals(response.status, 401);
  },
);

Deno.test("should deny access to /api/other without x-token", async () => {
  const request = new Request("http://localhost/api/other", {
    method: "GET",
  });
  const response = await app.fetch(request);
  assertEquals(response.status, 401);
});

Deno.test(
  "should pass auth and return 404 for /api/other with valid Bearer token",
  async () => {
    const token = await createValidToken();
    const request = new Request("http://localhost/api/other", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await app.fetch(request);
    assertEquals(response.status, 404);
  },
);

Deno.test("should allow access to /api/login with token header", async () => {
  const token = await createValidToken();
  const request = new Request("http://localhost/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ invitationCode: "test" }),
  });
  const response = await app.fetch(request);
  assertEquals(response.status, 200);
});
