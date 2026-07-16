import { Hono } from "hono";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppEnv } from "../config/env.ts";
import baseProxy from "../middlewares/baseProxy.ts";

const createProxyApp = (provider: string, targetUrl: string) => {
  const app = new Hono<{ Bindings: AppEnv }>();
  app.use("*", (c, next) => {
    c.env = { [`${provider.toUpperCase()}_API_KEY`]: "upstream-secret" };
    return next();
  });
  app.use(
    `/api/${provider}/*`,
    baseProxy({ provider, targetUrl, require_api_key: true }),
  );
  return app;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("base proxy middleware", () => {
  it("forwards method, query, body, and replaces the upstream auth token", async () => {
    const upstreamResponse = new Response("upstream response", {
      status: 201,
      headers: { "Content-Type": "application/json", "X-Upstream": "yes" },
    });
    const fetchMock = vi.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        const request = new Request(input, init);
        expect(request.url).toBe(
          "https://example.com/v1/chat?model=test&stream=true",
        );
        expect(request.method).toBe("POST");
        expect(request.headers.get("Authorization")).toBe(
          "Bearer upstream-secret",
        );
        expect(await request.text()).toBe('{"message":"hello"}');
        return upstreamResponse;
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const app = createProxyApp("test", "https://example.com");
    const response = await app.fetch(
      new Request("http://localhost/api/test/v1/chat?model=test&stream=true", {
        method: "POST",
        headers: {
          Authorization: "Bearer client-token",
          "Content-Type": "application/json",
        },
        body: '{"message":"hello"}',
      }),
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(201);
    expect(response.headers.get("X-Upstream")).toBe("yes");
    expect(await response.text()).toBe("upstream response");
  });

  it("returns a configuration error when a required provider key is absent", async () => {
    const app = new Hono<{ Bindings: AppEnv }>();
    app.use(
      "/api/test/*",
      baseProxy({
        provider: "test",
        targetUrl: "https://example.com",
        require_api_key: true,
      }),
    );

    const response = await app.fetch(
      new Request("http://localhost/api/test/v1/models"),
    );

    expect(response.status).toBe(500);
  });
});

describe("Tavily proxy middleware", () => {
  it("sends the configured key to Tavily and removes the client key", async () => {
    const fetchMock = vi.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        const request = new Request(input, init);
        expect(request.url).toBe("https://api.tavily.com/search");
        expect(request.method).toBe("POST");
        expect(request.headers.get("Authorization")).toBe(
          "Bearer upstream-secret",
        );
        expect(await request.json()).toEqual({
          query: "cloudflare workers",
          max_results: 3,
          api_key: "upstream-secret",
        });
        return new Response('{"results":[]}', { status: 200 });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const app = createProxyApp("tavily", "https://api.tavily.com");
    const response = await app.fetch(
      new Request("http://localhost/api/tavily/search", {
        method: "POST",
        headers: {
          Authorization: "Bearer client-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "cloudflare workers",
          max_results: 3,
          api_key: "client-key-must-not-be-forwarded",
        }),
      }),
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
  });
});
