import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

const createProject = (data: {
  id: string;
  name: string;
  url?: string;
  rootPath: string;
  manifest: Prisma.JsonValue;
}) =>
  prisma.project.create({
    data: {
      id: data.id,
      name: data.name,
      url: data.url ?? null,
      rootPath: data.rootPath,
      manifest: data.manifest as Prisma.InputJsonValue,
    },
  });

export { createProject };
