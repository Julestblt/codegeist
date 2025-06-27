import type { FastifyInstance, FastifyPluginOptions } from "fastify";

const apiRoutes = async (app: FastifyInstance, _opts: FastifyPluginOptions) => {
  app.get("/health", async () => ({ status: "ok" }));
};

export default apiRoutes;
