import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  startScanController,
  getScanStatusController,
  getScanResultsController,
  getDashboardAnalyticsController,
} from "@/controllers/scan.controller";

export const scanRoutes = async (
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) => {
  app.post("/:projectId/scan", startScanController);
  app.get("/:scanId/status", getScanStatusController);
  app.get("/:scanId/results", getScanResultsController);
  app.get("/dashboard/analytics", getDashboardAnalyticsController);
};
