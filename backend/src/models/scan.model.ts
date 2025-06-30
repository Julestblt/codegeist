import { prisma } from "@/lib/prisma";

export const createScan = (data: {
  id: string;
  projectId: string;
  status?: string;
  progress?: number;
}) =>
  prisma.scan.create({
    data: { status: "queued", progress: 0, ...data, results: {} },
    select: { id: true, status: true, progress: true },
  });

export const updateScan = (id: string, data: Record<string, unknown>) =>
  prisma.scan.update({ where: { id }, data });
