import type { FastifyRequest, FastifyReply } from "fastify";
import { saveAndUnzip } from "../services/storage.service";
import { buildManifest } from "../services/manifest.service";
import { createProject } from "../models/project.model";
import { Prisma } from "@prisma/client";

interface MultipartField {
  value: string;
}

const createProjectController = async (
  req: FastifyRequest,
  rep: FastifyReply
) => {
  const upload = await (req as any).file();
  if (!upload) return rep.status(400).send({ error: "zip file required" });

  const fields = upload.fields as Record<string, MultipartField>;
  const projectName = fields?.name?.value ?? upload.filename;
  const githubUrl = fields?.url?.value ?? null;

  const { projectId, rootPath } = await saveAndUnzip(upload.file);
  const manifest = await buildManifest(rootPath);

  const project = await createProject({
    id: projectId,
    name: projectName,
    url: githubUrl || undefined,
    rootPath,
    manifest: manifest as unknown as Prisma.JsonValue,
  });

  return rep.status(201).send({ project });
};

export { createProjectController };
