import type { FastifyInstance } from "fastify";
import {
  createProjectMeta,
  uploadArchive,
  deleteProjectController,
  getProjectsController,
  getProjectByIdController,
} from "../controllers/project.controller";

export const projectRoutes = async (app: FastifyInstance) => {
  await app.register(import("@fastify/multipart"));
  app.post("/", createProjectMeta);
  app.post("/:projectId/upload", uploadArchive);
  app.get("/", getProjectsController);
  app.get("/:projectId", getProjectByIdController);
  app.delete("/:projectId", deleteProjectController);
};
