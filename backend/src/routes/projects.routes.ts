import type { FastifyInstance } from "fastify";
import {
  createProjectMetaController,
  uploadArchiveController,
  deleteProjectController,
  getProjectsController,
  getProjectByIdController,
  getProjectFileController,
  getVulnerabilitiesForFileController,
} from "../controllers/project.controller";

export const projectRoutes = async (app: FastifyInstance) => {
  await app.register(import("@fastify/multipart"));
  app.post("/", createProjectMetaController);
  app.post("/:projectId/upload", uploadArchiveController);
  app.get("/", getProjectsController);
  app.get("/:projectId", getProjectByIdController);
  app.delete("/:projectId", deleteProjectController);
  app.get("/:projectId/file", getProjectFileController);
  app.get(
    "/:projectId/file/vulnerabilities",
    getVulnerabilitiesForFileController
  );
};
