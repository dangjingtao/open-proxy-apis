import { Context, Hono } from "hono";
import { sign } from "hono/jwt";
import { EXPIRED_TIME } from "../config/provider.config.ts";

const handleLogin = async (context: Context) => {
  const { invitationCode } = await context.req.json();
  // 默认向后兼容 API_KEY，推荐单独配置 INVITATION_CODE 与 JWT_SECRET
  const invitationCodeExpected = Deno.env.get("INVITATION_CODE") ??
    Deno.env.get("API_KEY") ?? "";
  const jwtSecret = Deno.env.get("JWT_SECRET") ?? Deno.env.get("API_KEY") ?? "";

  if (!invitationCodeExpected || !jwtSecret) {
    return context.json({ error: "Server auth config missing" }, 500);
  }

  if (invitationCode + "" === invitationCodeExpected) {
    const payload = {
      invitationCode,
      exp: EXPIRED_TIME, // 令牌过期时间
    };

    const token = await sign(payload, jwtSecret);

    return context.json({ success: true, token }, 200);
  } else {
    return context.json({ error: "Invalid invitationCode" }, 401);
  }
};

export default new Hono().post("/", handleLogin);
