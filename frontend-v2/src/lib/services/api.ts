import type { DashboardAnalytics, Project, Vulnerability } from '$lib/types/api';

const API_BASE = 'http://localhost:3000/api/v1';

const apiRequest = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
	const response = await fetch(`${API_BASE}${endpoint}`, {
		...options,
		headers: {
			...options.headers
		}
	});

	return await response.json();
};

const getProjects = () =>
	apiRequest<{ projects: Project[] }>('/projects', {}).then((d) => d.projects);

const getProjectById = (projectId: string) =>
	apiRequest<{ project: Project }>(`/projects/${projectId}`, {}).then((d) => d.project);

const getDashboardAnalytics = () =>
	apiRequest<DashboardAnalytics>('/scans/dashboard/analytics').then((d) => d);

const deleteProject = (projectId: string) =>
	apiRequest<{ status: boolean }>(`/projects/${projectId}`, {
		method: 'DELETE'
	});

const getFileContent = async (
	projectId: string,
	filePath: string
): Promise<{ content: string; mimeType: string }> => {
	const res = await fetch(
		`${API_BASE}/projects/${projectId}/file?path=${encodeURIComponent(filePath)}`
	);

	if (!res.ok) {
		const msg = await res.text().catch(() => 'Unknown error');
		throw new Error(`file ${res.status} – ${msg}`);
	}

	const mime = res.headers.get('content-type') ?? 'text/plain';

	if (mime.startsWith('image/')) {
		const blob = await res.blob();
		const b64 = await new Promise<string>((ok) => {
			const r = new FileReader();
			r.onloadend = () => ok((r.result as string).split(',')[1]);
			r.readAsDataURL(blob);
		});
		return { content: b64, mimeType: mime };
	}

	return { content: await res.text(), mimeType: mime };
};

const getVulnerabilitiesForFile = async (
	projectId: string,
	filePath: string,
	scanId?: string
): Promise<Vulnerability[] | []> => {
	const params = new URLSearchParams({
		filePath: filePath
	});

	if (scanId) {
		params.append('scanId', scanId);
	}

	return apiRequest<Vulnerability[] | []>(
		`/projects/${projectId}/file/vulnerabilities?${params.toString()}`
	).then((d) => d);
};

export {
	getProjects,
	getProjectById,
	getDashboardAnalytics,
	deleteProject,
	getFileContent,
	getVulnerabilitiesForFile
};
