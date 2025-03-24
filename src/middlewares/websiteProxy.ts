import { Context, Next } from "hono";

function base64ToString(base64: string): string {
  return decodeURIComponent(escape(atob(base64)));
}

export default () => {
  return async (c: Context, next: Next) => {
    try {
      const fullUrl = c.req.url;
      const url = new URL(fullUrl);
      const queryString = url.search.substring(1);
      // const { targetUrl } = await c.req.raw.clone().json();
      // const { targetUrl } = await c.req.query();
      const targetUrl = base64ToString(queryString);

      const authHeaders = new Headers(Object.fromEntries(c.req.raw.headers));
      // authHeaders.set("Content-Type", "application/json");
      authHeaders.delete("Authorization");

      const newRequest = new Request(targetUrl, {
        headers: authHeaders,
        method: "GET",
        redirect: "follow",
        // redirect: "manual", // 禁用自动重定向
      });

      const response = await fetch(newRequest);

      // // 设置 CSP 头
      // const csp = "default-src 'self'; script-src 'self'; object-src 'none';";
      // c.res = new Response(response.body, {
      //   status: response.status,
      //   headers: {
      //     ...response.headers,
      //     "Content-Security-Policy": csp,
      //     "X-Content-Type-Options": "nosniff",
      //     "X-Frame-Options": "DENY",
      //     "X-XSS-Protection": "1; mode=block",
      //   },
      // });

      c.res = new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });

      await next();
    } catch (error) {
      console.error("Error in proxy middleware:", error);
      c.res = new Response("Internal Server Error", { status: 500 });
    }
  };
};
