import { Context, Next } from "hono";

export default () => {
  return async (c: Context, next: Next) => {
    try {
      // const { targetUrl } = await c.req.raw.clone().json();
      const { targetUrl } = await c.req.query();
      // console.log(params);

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
