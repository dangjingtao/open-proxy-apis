import { Context, Next } from "hono";
// import { ProxyAgent } from "proxy-agent";

const baseProxy = ({
  provider,
  targetUrl,
  require_api_key,
}: {
  provider: string;
  targetUrl: string;
  require_api_key: boolean;
}) => {
  return async (c: Context, next: Next) => {
    const path = c.req.path.replace(`/api/${provider}`, "");
    const hostname = new URL(targetUrl).hostname;
    const protocol = new URL(targetUrl).protocol;
    const port = new URL(targetUrl).port;
    const url = `${protocol}//${hostname}${port ? `:${port}` : ""}${path}`;

    const API_KEY = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
    const authHeaders = new Headers(Object.fromEntries(c.req.raw.headers));
    // authHeaders.set("Content-Type", "application/json");
    if (require_api_key) {
      authHeaders.set("Authorization", `Bearer ${API_KEY}`);
    } else {
      authHeaders.delete("Authorization");
    }

    // const proxyUrl = "http://localhost:1080";
    // const proxy = new URL(proxyUrl);

    const newRequest = new Request(url, {
      headers: authHeaders,
      method: c.req.method,
      body:
        c.req.method !== "GET" && c.req.method !== "HEAD"
          ? c.req.raw.body
          : undefined,
      redirect: "follow",
    });

    // const response = await fetch(newRequest, {
    //   agent: new ProxyAgent(proxy),
    // });
    const response = await fetch(newRequest);

    c.res = new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });

    await next();
  };
};

export default baseProxy;
