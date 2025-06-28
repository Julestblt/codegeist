const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export interface Project {
  id: string;
  name: string;
  url?: string | null;
  totalSize?: number;
  totalFiles?: number;
  rootPath?: string;
  createdAt?: string;
  updatedAt?: string;
  manifest?: unknown;
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

/**
 * Crée uniquement les métadonnées projet.
 * @return l’id UUID du projet.
 */
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

/**
 * Upload le zip et met à jour totalSize & totalFiles.
 * @returns void
 */
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

export const listProjects = () =>
  request<{ projects: Project[] }>("/projects").then((d) => d.projects);

export const getProject = (id: string) =>
  request<{ project: Project }>(`/projects/${id}`).then((d) => d.project);

export const deleteProject = (id: string) =>
  request<void>(`/projects/${id}`, { method: "DELETE" });
