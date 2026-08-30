import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handleApiRequest } from "./server/api.mjs";

function competitionApi(environment) {
  return {
    name: "phuturai-competition-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const handled = await handleApiRequest(request, response, environment);
        if (!handled) next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const environment = { ...loadEnv(mode, process.cwd(), ""), ...process.env };

  return {
    plugins: [react(), competitionApi(environment)],
    server: { port: 4173 },
  };
});
