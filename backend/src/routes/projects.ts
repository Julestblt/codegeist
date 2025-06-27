import type { FastifyInstance } from "fastify";
import { createProjectController } from "../controllers/project.controller";

const projectRoutes = async (app: FastifyInstance) => {
  await app.register(import("@fastify/multipart"));

  app.post("/", createProjectController);
};

export { projectRoutes };
