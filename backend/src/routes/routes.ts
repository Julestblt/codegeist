import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { chatRoutes, projectRoutes, scanRoutes } from "./";

const apiRoutes = async (app: FastifyInstance, _opts: FastifyPluginOptions) => {
  app.register(projectRoutes, { prefix: "projects" });
  app.register(scanRoutes, { prefix: "scans" });
  app.register(chatRoutes, { prefix: "chat" });
  app.get("/health", async () => ({ status: "ok" }));
};

export default apiRoutes;
