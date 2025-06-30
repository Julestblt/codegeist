import type { FastifyRequest, FastifyReply } from "fastify";
import { scanQueue } from "@/queues/scan.queue";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const startScanController = async (
  req: FastifyRequest<{ Params: { projectId: string } }>,
  rep: FastifyReply
) => {
  const { projectId } = req.params;

  const exists = await prisma.project.count({ where: { id: projectId } });
  if (!exists) {
    return rep.status(404).send({ error: "Project not found" });
  }

  const scanId = randomUUID();
  await prisma.scan.create({
    data: { id: scanId, projectId, status: "queued", progress: 0, results: {} },
  });

  await scanQueue.add(
    "scan",
    { scanId, projectId },
    {
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  return rep.status(202).send({
    scan: { id: scanId, status: "queued", progress: 0 },
  });
};

export const getScanStatusController = async (
  req: FastifyRequest<{ Params: { scanId: string } }>,
  rep: FastifyReply
) => {
  const { scanId } = req.params;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    select: {
      id: true,
      status: true,
      progress: true,
      startedAt: true,
      finishedAt: true,
    },
  });

  if (!scan) {
    return rep.status(404).send({ error: "Scan not found" });
  }

  return rep.send(scan);
};

export const getScanResultsController = async (
  req: FastifyRequest<{ Params: { scanId: string } }>,
  rep: FastifyReply
) => {
  const { scanId } = req.params;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      project: {
        include: {
          issues: {
            orderBy: [
              { severity: "desc" },
              { filePath: "asc" },
              { lines: "asc" },
            ],
          },
        },
      },
    },
  });

  if (!scan) {
    return rep.status(404).send({ error: "Scan not found" });
  }

  return rep.send({
    scan: {
      id: scan.id,
      status: scan.status,
      progress: scan.progress,
      startedAt: scan.startedAt,
      finishedAt: scan.finishedAt,
      results: scan.results,
    },
    issues: scan.project.issues,
    summary: scan.results as any,
  });
};
export const getDashboardAnalyticsController = async (
  _req: FastifyRequest,
  rep: FastifyReply
) => {
  const totalProjects = await prisma.project.count({
    where: {
      scans: {
        some: {
          status: "done",
        },
      },
    },
  });

  const totalIssues = await prisma.issue.count();

  const vulnerabilityCounts = await prisma.issue.groupBy({
    by: ["severity"],
    _count: {
      id: true,
    },
  });

  const analytics = {
    totalProjectsAnalyzed: totalProjects,
    totalIssues,
    critical:
      vulnerabilityCounts.find((v) => v.severity === "CRITICAL")?._count.id ||
      0,
    high:
      vulnerabilityCounts.find((v) => v.severity === "HIGH")?._count.id || 0,
    medium:
      vulnerabilityCounts.find((v) => v.severity === "MEDIUM")?._count.id || 0,
    low: vulnerabilityCounts.find((v) => v.severity === "LOW")?._count.id || 0,
  };

  return rep.send(analytics);
};
