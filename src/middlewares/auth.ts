// middleware/auth.ts
import { Context, HonoRequest, Next } from "hono";
import { verify } from "hono/jwt";

const getJwtSecret = () => {
  return Deno.env.get("JWT_SECRET") ?? Deno.env.get("API_KEY") ?? "";
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
  const jwtSecret = getJwtSecret();

  if (!token || !jwtSecret) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  try {
    const isValid = await verify(token, jwtSecret);
    if (!isValid) {
      return context.json({ error: "Unauthorized" }, 401);
    }
  } catch (_error) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
