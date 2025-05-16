import { Context, Hono } from "hono";
// import { createFactory } from "hono/factory";
import { sign } from "hono/jwt";
import { EXPIRED_TIME } from "../config/provider.config.ts";
// import { HTTPException } from "hono/http-exception";

const handleLogin = async (context: Context) => {
  const { invitationCode } = await context.req.json();
  // !此处应从环境遍历中获取邀请码数组，并验证邀请码是否有效
  const key = Deno.env.get("API_KEY") + "";

  if (invitationCode + "" === key) {
    const payload = {
      invitationCode,
      exp: EXPIRED_TIME, // 令牌过期时间
    };

    const token = await sign(payload, key);

    return context.json({ success: true, token }, 200);
  } else {
    return context.json({ error: "Invalid invitationCode" }, 401);
  }
};

export default new Hono().post("/", handleLogin);
