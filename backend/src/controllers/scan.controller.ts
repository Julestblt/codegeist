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
