import { Queue, Worker, Job } from "bullmq";
import { promises as fs } from "node:fs";
import path from "node:path";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import {
  SYSTEM_PROMPT,
  CODE_SCAN_ALLOW_LIST,
  ALLOWED_FILENAMES,
} from "@/constants";

export interface ScanJob {
  scanId: string;
  projectId: string;
}

interface ManifestEntry {
  path: string;
  size: number;
  isDir: boolean;
}

export const scanQueue = new Queue<ScanJob>("scan", {
  connection: redis,
});

const LM_API_URL =
  process.env.LM_API_URL ?? "http://192.168.1.12:1234/v1/chat/completions";
const LM_MODEL = process.env.LM_MODEL ?? "qwen/qwen3-14b";

const betterLog = (msg: string) => {
  console.log("===================================================");
  console.log(msg);
  console.log("===================================================");
};

function isFileExtensionAllowed(filePath: string): boolean {
  const extension = path.extname(filePath).toLowerCase().slice(1);

  const basename = path.basename(filePath).toLowerCase();

  if (ALLOWED_FILENAMES.includes(basename as any)) {
    return true;
  }

  return CODE_SCAN_ALLOW_LIST.includes(extension as any);
}

async function auditFragment(filename: string, code: string): Promise<string> {
  const body = {
    model: LM_MODEL,
    temperature: 0,
    max_tokens: 5000,
    stream: false,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      { role: "user", content: `File: ${filename}\n\`\`\`\n${code}\n\`\`\`` },
    ],
  };

  console.log(LM_API_URL);

  const res = await fetch(LM_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // @ts-ignore
    timeout: 0,
  });

  if (!res.ok) {
    throw new Error(`LLM HTTP ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content ?? "";
}

export const scanWorker = new Worker<ScanJob>(
  "scan",
  async (job: Job<ScanJob>) => {
    const { scanId, projectId } = job.data;

    try {
      await prisma.scan.update({
        where: { id: scanId },
        data: { status: "running", startedAt: new Date() },
      });

      await prisma.issue.deleteMany({
        where: { projectId: projectId },
      });

      const project = await prisma.project.findUniqueOrThrow({
        where: { id: projectId },
        select: { rootPath: true, manifest: true },
      });

      if (!project.manifest || !Array.isArray(project.manifest)) {
        throw new Error(`Project ${projectId} has no valid manifest`);
      }

      betterLog(`🔍  Scanning project ${projectId} at ${project.rootPath}`);

      const manifest: ManifestEntry[] = Array.isArray(project.manifest)
        ? (project.manifest as unknown as ManifestEntry[])
        : [];

      const allIssues: any[] = [];

      for (const [idx, entry] of manifest.entries()) {
        if (entry.isDir) continue;

        if (!isFileExtensionAllowed(entry.path)) {
          console.log(
            `⏭️  Skipping ${entry.path} (extension not in allow list)`
          );
          continue;
        }

        const abs = path.join(project.rootPath, entry.path);
        const code = await fs.readFile(abs, "utf8");

        console.log(`🔍  [${idx + 1}/${manifest.length}] ${entry.path}`);

        try {
          const result = await auditFragment(entry.path, code);

          const parsedResult = JSON.parse(
            result.replace("<think>\n\n</think>\n\n", "")
          );

          betterLog(
            `🔍  Result for ${entry.path}:\n${JSON.stringify(
              parsedResult,
              null,
              2
            )}`
          );

          if (!Array.isArray(parsedResult.issues)) {
            throw new Error(
              "Invalid response format: 'issues' is not an array"
            );
          }

          for (const issue of parsedResult.issues) {
            allIssues.push({
              ...issue,
              filePath: entry.path,
              scanId: scanId,
            });
          }

          if (parsedResult.issues.length > 0) {
            await prisma.issue.createMany({
              data: parsedResult.issues.map((issue: any) => ({
                projectId: projectId,
                scanId: scanId,
                filePath: entry.path,
                lines: issue.lines,
                type: issue.type,
                severity: issue.severity.toUpperCase(),
                description: issue.description,
                recommendation: issue.recommendation,
                cwe: issue.cwe || null,
              })),
              skipDuplicates: true,
            });
          }
        } catch (err) {
          console.error(
            `❌  LLM error on ${entry.path}: ${(err as Error).message}`
          );
        }

        const pct = Math.round(((idx + 1) / manifest.length) * 100);
        await job.updateProgress(pct);
        await prisma.scan.update({
          where: { id: scanId },
          data: { progress: pct },
        });
      }

      const summary = {
        totalIssues: allIssues.length,
        issuesBySeverity: {
          critical: allIssues.filter(
            (i) => i.severity?.toLowerCase() === "critical"
          ).length,
          high: allIssues.filter((i) => i.severity?.toLowerCase() === "high")
            .length,
          medium: allIssues.filter(
            (i) => i.severity?.toLowerCase() === "medium"
          ).length,
          low: allIssues.filter((i) => i.severity?.toLowerCase() === "low")
            .length,
          info: allIssues.filter((i) => i.severity?.toLowerCase() === "info")
            .length,
        },
        issuesByType: allIssues.reduce((acc: any, issue: any) => {
          acc[issue.type] = (acc[issue.type] || 0) + 1;
          return acc;
        }, {}),
        scannedFiles: manifest.filter((e) => !e.isDir).length,
      };

      await prisma.scan.update({
        where: { id: scanId },
        data: {
          status: "done",
          finishedAt: new Date(),
          progress: 100,
          results: summary,
        },
      });
    } catch (error) {
      console.error(`❌  Scan ${scanId} failed:`, error);

      await prisma.scan.update({
        where: { id: scanId },
        data: {
          status: "failed",
          finishedAt: new Date(),
          results: {
            error: error instanceof Error ? error.message : "Unknown error",
            totalIssues: 0,
            issuesBySeverity: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
              info: 0,
            },
            issuesByType: {},
            scannedFiles: 0,
          },
        },
      });

      throw error;
    }
  },
  { connection: redis, concurrency: 1 }
);

scanWorker
  .on("ready", () => console.log("👷  scan-worker ready"))
  .on("failed", (job, err) =>
    console.error(`❌  job ${job?.id ?? "?"} failed: ${err.message}`)
  )
  .on("completed", (job) => console.log(`✅  job ${job.id} completed`));

export async function getScanResults(scanId: string) {
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
    throw new Error(`Scan ${scanId} not found`);
  }

  return {
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
  };
}

export async function getProjectScanHistory(projectId: string) {
  return await prisma.scan.findMany({
    where: { projectId },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      status: true,
      progress: true,
      startedAt: true,
      finishedAt: true,
      results: true,
    },
  });
}
