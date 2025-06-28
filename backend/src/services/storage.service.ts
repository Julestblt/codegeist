import { mkdir, rm } from "node:fs/promises";
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

const deleteProjectFolder = async (projectId: string): Promise<void> => {
  const rootPath = `uploads/${projectId}`;
  try {
    await rm(rootPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to delete project ${projectId}:`, error);
    throw new Error(`Could not delete project ${projectId}`);
  }
};

export { saveAndUnzip, deleteProjectFolder };
