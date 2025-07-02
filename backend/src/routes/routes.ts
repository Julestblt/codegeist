import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { projectRoutes, scanRoutes } from "./";

const apiRoutes = async (app: FastifyInstance, _opts: FastifyPluginOptions) => {
  app.register(projectRoutes, { prefix: "projects" });
  app.register(scanRoutes, { prefix: "scans" });
  app.get("/health", async () => ({ status: "ok" }));
};

export default apiRoutes;
