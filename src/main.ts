import { Hono, Context } from "hono";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import { csrf } from "hono/csrf";
import cors from "./middlewares/cors.ts";
import { checkToken } from "./middlewares/auth.ts";
import baseProxy from "./middlewares/baseProxy.ts";
import websiteProxy from "./middlewares/websiteProxy.ts";
import handleLogin from "./handler/login.ts";
import { providerConfig } from "./config/provider.config.ts";
import handleNotion from "./handler/notion.ts";

const PORT = 8787;

const app = new Hono();
// app.use(csrf());
app.use("api/*", cors());

app.use(
  poweredBy({
    serverName: "open-proxy-apis",
  })
);

app.use(logger());

// 应用中间件到所有 /api/* 路由，但排除 /api/login
app.use("/api/*", checkToken);

app.get("/api/status", async (c) => {
  return c.json({
    appName: "open-proxy-apis",
    statusCode: 200,
    time: Date.now(),
  });
});

app.route("/api/login", handleLogin);

providerConfig.forEach(
  ({ provider_name, api_host, require_api_key, standAlone }) => {
    if (standAlone) {
      app.route(`api/${provider_name}`, handleNotion);
    } else {
      app.use(
        `api/${provider_name}/*`,
        baseProxy({
          provider: provider_name,
          targetUrl: api_host || "/",
          require_api_key,
        })
      );
    }
  }
);

// 网页请求代理（get）
app.use("/proxy/website/*", cors());
app.use("/proxy/website/*", websiteProxy());

Deno.serve({ port: PORT }, app.fetch);
