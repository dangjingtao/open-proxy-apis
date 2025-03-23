// middleware/auth.ts
import { Context, Next } from "hono";
import { verify } from "hono/jwt";

const API_KEY = Deno.env.get("API_KEY") || "";

export const checkToken = async (context: Context, next: Next) => {
  if (
    context.req.path === "/api/login" ||
    context.req.path.startsWith("/api/github-api")
  ) {
    await next();
    return;
  }

  const token = (context.req.header("Authorization") || "").replace(
    "Bearer ",
    ""
  );

  if (!token) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  try {
    const isValid = await verify(token, API_KEY);
    if (!isValid) {
      return context.json({ error: "Unauthorized" }, 401);
    }
  } catch (_error) {
    console.log(_error);
    return context.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
