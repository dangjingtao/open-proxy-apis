import { Context, HonoRequest, Next } from "hono";
import { tavily } from "@tavily/core";

const handleTavily = async (req: HonoRequest, API_KEY: string) => {
  const json = await req.json();
  delete json.api_key;
  // const tavilyClient = tavily({ apiKey: API_KEY });

  const resp = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      query: json.query,
      max_results: json.max_results,
      api_key: API_KEY,
    }),
  });

  return resp;

  // // console.log(API_KEY, json);
  // const response = await tavilyClient.search(json.query, {
  //   max_results: json.maxResult,
  // });
  // return response;
};

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
    const API_KEY = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
    if (!API_KEY && require_api_key) {
      throw new Error(`Please set ${provider.toUpperCase()}_API_KEY`);
    }

    const isTavilyAPI = c.req.path.startsWith("/api/tavily");

    let response = null;

    if (isTavilyAPI) {
      response = await handleTavily(c.req, API_KEY);
      console.log(response);
    } else {
      const authHeaders = new Headers(Object.fromEntries(c.req.raw.headers));
      if (require_api_key && API_KEY) {
        authHeaders.set("Authorization", `Bearer ${API_KEY}`);
      } else {
        authHeaders.delete("Authorization");
      }

      const path = c.req.path.replace(`/api/${provider}`, "");
      const hostname = new URL(targetUrl).hostname;
      const protocol = new URL(targetUrl).protocol;
      const port = new URL(targetUrl).port;
      const url = `${protocol}//${hostname}${port ? `:${port}` : ""}${path}`;

      const proxyBody = c.req.raw.body;

      const newRequest = new Request(url, {
        headers: authHeaders,
        method: c.req.method,
        body:
          c.req.method !== "GET" && c.req.method !== "HEAD"
            ? (proxyBody as BodyInit)
            : undefined,
        redirect: "follow",
      });

      response = await fetch(newRequest);
    }

    c.res = new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });

    await next();
  };
};

export default baseProxy;
