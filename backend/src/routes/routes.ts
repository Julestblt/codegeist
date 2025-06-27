import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { chatRoutes, projectRoutes } from "./";

const apiRoutes = async (app: FastifyInstance, _opts: FastifyPluginOptions) => {
  app.register(projectRoutes, { prefix: "projects" });
  app.register(chatRoutes, { prefix: "chat" });
  app.get("/health", async () => ({ status: "ok" }));
};

export default apiRoutes;
