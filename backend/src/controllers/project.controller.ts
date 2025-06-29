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
    return rep.status(204).send();
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
  rep.send({ projects });
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
  rep.send({ project });
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
    return rep.type("text/plain").send(content);
  } catch {
    return rep.status(404).send({ error: "file not found" });
  }
};

export {
  createProjectMetaController,
  uploadArchiveController,
  deleteProjectController,
  getProjectsController,
  getProjectByIdController,
  getProjectFileController,
};
