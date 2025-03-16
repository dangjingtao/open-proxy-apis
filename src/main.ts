import { Hono, Context } from "hono";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import cors from "./middlewares/cors.ts";
import { checkToken } from "./middlewares/auth.ts";
import baseProxy from "./middlewares/baseProxy.ts";
import handleLogin from "./handler/login.ts";
import { ProviderKeys, providerConfig } from "./config/provider.config.ts";

const app = new Hono();
app.use("api/*", cors());
app.use(
  poweredBy({
    serverName: "open-proxy-apis",
  })
);

app.use(logger());

// 应用中间件到所有 /api/* 路由，但排除 /api/login
app.use("/api/*", checkToken);

const PORT = 8787;

app.get("/api/status", async (c) => {
  return c.json({
    appName: "open-proxy-apis",
    statusCode: 200,
    time: Date.now(),
  });
});

app.route("/api/login", handleLogin);

providerConfig.forEach(({ provider_name, api_host, require_api_key }) => {
  app.use(
    `api/${provider_name}/*`,
    baseProxy({ provider: provider_name, targetUrl: api_host, require_api_key })
  );
});

Deno.serve({ port: PORT }, app.fetch);
