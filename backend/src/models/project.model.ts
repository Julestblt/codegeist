import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import type { ManifestNode } from "../services/manifest.service";

const createProjectMeta = async (data: {
  id: string;
  name: string;
  url?: string;
}) => {
  return prisma.project.create({
    data: {
      id: data.id,
      name: data.name,
      url: data.url ?? null,
      rootPath: "",
      totalSize: 0,
      totalFiles: 0,
      manifest: [] as Prisma.InputJsonValue,
    },
  });
};

const updateProjectWithArchive = async (data: {
  id: string;
  rootPath: string;
  totalSize: number;
  totalFiles?: number;
  manifest: ManifestNode[];
}) => {
  return prisma.project.update({
    where: { id: data.id },
    data: {
      rootPath: data.rootPath,
      totalSize: data.totalSize,
      totalFiles: data.totalFiles,
      manifest: data.manifest as unknown as Prisma.InputJsonValue,
    },
  });
};

const deleteProject = async (id: string) => {
  return prisma.project.delete({ where: { id } });
};

export { createProjectMeta, updateProjectWithArchive, deleteProject };
