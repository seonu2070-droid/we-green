import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import { validateAnalyticsDeployment } from "./build/analytics-env.ts";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    validateAnalyticsDeployment({
      ...loadEnv(mode, process.cwd(), "VITE_"),
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    });
  }
  return {
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
  test: {
    exclude: [...configDefaults.exclude, ".claude/**"],
    projects: [
      {
        extends: true,
        test: {
          name: "server",
          environment: "node",
          include: ["server/**/*.test.ts", "build/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "client",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: ["./src/test/setup.ts"],
        },
      },
    ],
  },
  };
});
