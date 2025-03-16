// middleware/proxy.ts
import { Context, Next } from "hono";

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
    console.log(">>>>>>>>>>>>>>>>>", c.req, url);

    const API_KEY = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
    const authHeaders = new Headers(Object.fromEntries(c.req.raw.headers));

    if (require_api_key) {
      authHeaders.set("Authorization", `Bearer ${API_KEY}`);
    } else {
      authHeaders.delete("Authorization");
    }

    const newRequest = new Request(url, {
      headers: authHeaders,
      method: c.req.method,
      body:
        c.req.method !== "GET" && c.req.method !== "HEAD"
          ? c.req.json()
          : undefined,
      redirect: "follow",
    });

    console.error(">>>>>>>>>>>>>>>>>>", url);

    //  const result = await fetch(newRequest);

    const response = await fetch(newRequest);

    c.res = new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });

    await next();
  };
};

export default baseProxy;
