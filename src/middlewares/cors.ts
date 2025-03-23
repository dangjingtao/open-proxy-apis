import { allowedOrigins } from "./../config/origin.config.ts";
import { cors } from "hono/cors";

export default () =>
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: [],
  });
