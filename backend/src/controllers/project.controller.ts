import type { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "node:crypto";
import { saveAndUnzip, deleteProjectFolder } from "../services/storage.service";
import { buildManifest } from "../services/manifest.service";
import {
  createProjectMeta,
  updateProjectWithArchive,
  deleteProject,
} from "../models/project.model";
import { prisma } from "../lib/prisma";
import path from "node:path";
import { readFile } from "node:fs/promises";
import mime from "mime-types";

const createProjectMetaController = async (
  req: FastifyRequest<{ Body: { name: string; url?: string } }>,
  rep: FastifyReply
) => {
  const { name, url } = req.body ?? {};
  if (!name?.trim()) return rep.status(400).send({ error: "name required" });

  const id = randomUUID();
  const project = await createProjectMeta({ id, name, url });

  return rep.status(201).send({ project });
};

const uploadArchiveController = async (
  req: FastifyRequest<{ Params: { projectId: string } }>,
  rep: FastifyReply
) => {
  const { projectId } = req.params;
  const zipPart = await (req as any).file();
  if (!zipPart) return rep.status(400).send({ error: "zip missing" });

  const exists = await prisma.project.findUnique({ where: { id: projectId } });
  if (!exists) return rep.status(404).send({ error: "project not found" });

  const { rootPath } = await saveAndUnzip(zipPart.file);
  const { manifest, totalSize } = await buildManifest(rootPath);
  const totalFiles = manifest.length;

  const updatedProject = await updateProjectWithArchive({
    id: projectId,
    rootPath,
    totalSize,
    totalFiles,
    manifest,
  });

  return rep.status(201).send({ project: updatedProject });
};

const deleteProjectController = async (
  req: FastifyRequest<{ Params: { projectId: string } }>,
  rep: FastifyReply
) => {
  const { projectId } = req.params;
  try {
    await deleteProject(projectId);
    await deleteProjectFolder(projectId);
    return rep.status(200).send({ success: true });
  } catch {
    return rep.status(500).send({ error: "delete failed" });
  }
};

const getProjectsController = async (
  _req: FastifyRequest,
  rep: FastifyReply
) => {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      totalSize: true,
      totalFiles: true,
      url: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  rep.send({ projects, length: projects.length });
};

const getProjectByIdController = async (
  req: FastifyRequest<{ Params: { projectId: string } }>,
  rep: FastifyReply
) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.projectId },
    select: {
      id: true,
      name: true,
      url: true,
      totalSize: true,
      totalFiles: true,
      manifest: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!project) return rep.status(404).send({ error: "not found" });

  const projectActiveScan = await prisma.scan.findFirst({
    where: { projectId: project.id, status: "running" },
    select: { id: true, status: true, progress: true },
  });

  const projectScans = await prisma.scan.findMany({
    where: { projectId: project.id },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      projectId: true,
      status: true,
      progress: true,
      startedAt: true,
      finishedAt: true,
      results: true,
    },
  });
  const issues = await prisma.issue.findMany({
    where: { projectId: project.id },
    select: {
      id: true,
      scanId: true,
      projectId: true,
      severity: true,
      description: true,
      recommendation: true,
      filePath: true,
      lines: true,
      type: true,
      cwe: true,
    },
  });

  projectScans.forEach((scan) => {
    const scanIssues = issues.filter((issue) => issue.scanId === scan.id);
    (scan as any).issues = scanIssues;
  });

  rep.send({
    project: { ...project, activeScan: projectActiveScan, scans: projectScans },
  });
};

const getProjectFileController = async (
  req: FastifyRequest<{
    Params: { projectId: string };
    Querystring: { path?: string };
  }>,
  rep: FastifyReply
) => {
  const { projectId } = req.params;
  const relPath = req.query.path;
  if (!relPath)
    return rep.status(400).send({ error: "query param `path` required" });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { rootPath: true },
  });
  if (!project) return rep.status(404).send({ error: "project not found" });

  const absRoot = path.resolve(project.rootPath);
  const absFile = path.resolve(absRoot, relPath);
  if (!absFile.startsWith(absRoot))
    return rep.status(400).send({ error: "path traversal detected" });

  try {
    const content = await readFile(absFile, "utf8");
    const ext = path.extname(absFile).toLowerCase();
    const mimeType = mime.lookup(ext) || "application/octet-stream";
    return rep.type(mimeType).send(content);
  } catch {
    return rep.status(404).send({ error: "file not found" });
  }
};

const getVulnerabilitiesForFileController = async (
  req: FastifyRequest<{
    Params: { projectId: string };
    Querystring: { filePath: string; scanId?: string };
  }>,
  rep: FastifyReply
) => {
  const { projectId } = req.params;
  const { filePath, scanId } = req.query;

  const whereClause: any = {
    projectId,
    filePath,
  };

  // If scanId is provided, filter by that specific scan
  if (scanId) {
    whereClause.scanId = scanId;
  }

  const vulnerabilities = await prisma.issue.findMany({
    where: whereClause,
    select: {
      id: true,
      scanId: true,
      projectId: true,
      severity: true,
      description: true,
      recommendation: true,
      filePath: true,
      lines: true,
      type: true,
      cwe: true,
    },
  });

  if (!vulnerabilities || vulnerabilities.length === 0) {
    return rep.status(200).send([]);
  }

  return rep.send(vulnerabilities);
};

export {
  createProjectMetaController,
  uploadArchiveController,
  deleteProjectController,
  getProjectsController,
  getVulnerabilitiesForFileController,
  getProjectByIdController,
  getProjectFileController,
};
