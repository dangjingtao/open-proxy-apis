import environment from "@/lib/environment.ts";
// import config from "@/lib/config.ts";
// import "@/lib/initialize.ts";
import server from "@/lib/server-dev.ts";
// import logger from "@/lib/logger.ts";

const SERVICE_PROVIDERS = ["qwen-free", "kimi-free", "deepseek-free"];

const startupTime = performance.now();

(async () => {
  // logger.header();

  // await server.registerServiceProviders(SERVICE_PROVIDERS);

  console.log("<<<< server start >>>>");
  console.table([environment]);
  console.log("<<<< service provider info >>>>");
  console.table(
    SERVICE_PROVIDERS.map((name) => ({
      modelsName: name,
      // api_url: `http://${config.service.host}:${config.service.port}/${name}/v1`,
    }))
  );
  // !
  // await server.listen();

  // config.service.bindAddress &&
  //   logger.success("Service bind address:", config.service.bindAddress);
})()
  // .then(() =>
  //   logger.success(
  //     `Service startup completed (${Math.floor(
  //       performance.now() - startupTime
  //     )}ms)`
  //   )
  // )
  .catch((err) => console.error(err));
