import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Extract } from "unzipper";
import { randomUUID } from "node:crypto";

const saveAndUnzip = async (
  fileStream: NodeJS.ReadableStream
): Promise<{ projectId: string; rootPath: string }> => {
  const projectId = randomUUID();
  const rootPath = `uploads/${projectId}`;
  await mkdir(rootPath, { recursive: true });
  await pipeline(fileStream, Extract({ path: rootPath }));
  return { projectId, rootPath };
};

export { saveAndUnzip };
