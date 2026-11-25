import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_API_PROXY_TARGET = "http://localhost:5000";

export default defineConfig(({ mode }) => {
  // The empty prefix also reads variables without VITE_, which never reach the browser bundle
  const env = loadEnv(mode, fileURLToPath(new URL(".", import.meta.url)), "");
  // The web calls a relative /api, so in dev and preview it shares one origin with the API
  const proxy = { "/api": env.API_PROXY_TARGET || DEFAULT_API_PROXY_TARGET };

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: { proxy },
    preview: { proxy },
  };
});
