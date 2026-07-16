// middleware/auth.ts
import { Context, HonoRequest, Next } from "hono";
import { verify } from "hono/jwt";
import { type AppEnv, getEnv } from "../config/env.ts";

const getJwtSecret = (env: AppEnv) => {
  return getEnv(env, "JWT_SECRET") ?? getEnv(env, "API_KEY") ?? "";
};

const getTokenFromRequest = (req: HonoRequest) => {
  const authHeader = req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
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

  const token = getTokenFromRequest(context.req);
  const jwtSecret = getJwtSecret(context.env);

  if (!token || !jwtSecret) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  try {
    const isValid = await verify(token, jwtSecret, "HS256");
    if (!isValid) {
      return context.json({ error: "Unauthorized" }, 401);
    }
  } catch (_error) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
