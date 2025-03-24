// middleware/auth.ts
import { Context, HonoRequest, Next } from "hono";
import { verify } from "hono/jwt";

const API_KEY = Deno.env.get("API_KEY") || "";

const getTokenFromRequest = (req: HonoRequest) => {
  // @ts-ignore: no types for headers
  const authHeader = req.header()["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return "";
};

export const checkToken = async (context: Context, next: Next) => {
  if (
    context.req.path === "/api/login" ||
    context.req.path.startsWith("/api/github-api")
  ) {
    await next();
    return;
  }

  const token = await getTokenFromRequest(context.req);

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
