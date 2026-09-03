import { createApp } from "./app.ts";
import { config } from "./config.ts";

const app = createApp();
const server = app.listen(config.port, "0.0.0.0", (error) => {
  if (error) throw error;
  console.log(`WE:GREEN server listening on http://localhost:${config.port}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received. Closing server.`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
