const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export interface Manifest {
  path: string;
  size: number;
  isDir: boolean;
}

export interface Project {
  id: string;
  name: string;
  url?: string | null;
  totalSize?: number;
  totalFiles?: number;
  rootPath?: string;
  createdAt?: string;
  updatedAt?: string;
  manifest?: Manifest[];
  scans?: Scans[];
}

export interface Vulnerability {
  id: string;
  scanId: string;
  projectId: string;
  filePath: string;
  lines: number[];
  type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  recommendation: string;
  cwe?: string | null;
}

export interface Scans {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  startedAt?: string;
  finishedAt?: string;
  results?: Record<string, any>;
}

type JSONValue = unknown;

async function request<T = JSONValue>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);

  if (!res.ok) {
    const detail = await res.text().catch(() => "Unknown error");
    throw new Error(`API error ${res.status} – ${detail}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const createProject = async (
  name: string,
  url?: string | null
): Promise<string> => {
  const { project } = await request<{ project: { id: string } }>("/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, url }),
  });
  return project.id;
};

export const uploadProjectZip = async (
  projectId: string,
  file: File
): Promise<{ project: Project }> => {
  const fd = new FormData();
  fd.append("file", file);
  return request<{ project: Project }>(`/projects/${projectId}/upload`, {
    method: "POST",
    body: fd,
  });
};

export const getFileContent = async (
  projectId: string,
  filePath: string
): Promise<{ content: string; mimeType: string }> => {
  const res = await fetch(
    `${API_BASE}/projects/${projectId}/file?path=${encodeURIComponent(
      filePath
    )}`
  );

  if (!res.ok) {
    const msg = await res.text().catch(() => "Unknown error");
    throw new Error(`file ${res.status} – ${msg}`);
  }

  const mime = res.headers.get("content-type") ?? "text/plain";

  if (mime.startsWith("image/")) {
    const blob = await res.blob();
    const b64 = await new Promise<string>((ok) => {
      const r = new FileReader();
      r.onloadend = () => ok((r.result as string).split(",")[1]);
      r.readAsDataURL(blob);
    });
    return { content: b64, mimeType: mime };
  }

  return { content: await res.text(), mimeType: mime };
};

export const listProjects = () =>
  request<{ projects: Project[]; length: number }>("/projects").then(
    (d) => d.projects
  );

export const getProject = (id: string) =>
  request<{ project: Project; scans: Scans[] }>(`/projects/${id}`).then(
    (d) => d.project
  );

export const deleteProject = (id: string) =>
  request<{ status: boolean }>(`/projects/${id}`, { method: "DELETE" });

export const getDashboardAnalytics = () =>
  request<{
    totalProjectsAnalyzed: number;
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>("/scans/dashboard/analytics");

export const getVulnerabilitiesForFile = (
  projectId: string,
  filePath: string
): Promise<Vulnerability[]> =>
  request<Vulnerability[]>(
    `/projects/${projectId}/file/vulnerabilities?filePath=${encodeURIComponent(
      filePath
    )}`
  );
