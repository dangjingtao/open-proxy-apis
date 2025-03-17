import { Context, Hono } from "hono";
// import { createFactory } from "hono/factory";
import { sign } from "hono/jwt";
// import { HTTPException } from "hono/http-exception";

const handleLogin = async (context: Context) => {
  const { invitationCode } = await context.req.json();
  const key = Deno.env.get("API_KEY") + "";

  if (invitationCode + "" === key) {
    const payload = {
      invitationCode,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 令牌在 60 分钟后过期
    };

    const token = await sign(payload, key);

    return context.json({ success: true, token }, 200);
  } else {
    return context.json({ error: "Invalid invitationCode" }, 401);
  }
};

export default new Hono().post("/", handleLogin);
