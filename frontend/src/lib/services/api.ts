import type { DashboardAnalytics, Project, Scans, Vulnerability } from '$lib/types/api';

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

const createProject = async (name: string, url?: string | null): Promise<string> => {
	const {
		project: { id }
	} = await apiRequest<{ project: { id: string } }>('/projects', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, url })
	});
	return id;
};

const uploadProjectZip = async (projectId: string, file: File): Promise<{ project: Project }> => {
	const fd = new FormData();
	fd.append('file', file);
	return apiRequest<{ project: Project }>(`/projects/${projectId}/upload`, {
		method: 'POST',
		body: fd
	});
};

const startScan = (
	projectId: string
): Promise<{
	scan: {
		id: string;
		status: 'queued' | 'running' | 'done' | 'failed';
		progress: number;
	};
}> =>
	apiRequest(`/scans/${projectId}/scan`, {
		method: 'POST'
	});

const getScanStatus = (scanId: string): Promise<Scans> => {
	return apiRequest<Scans>(`/scans/${scanId}/status`, {
		method: 'GET'
	});
};

const getScanResults = (scanId: string) => {
	return apiRequest<{
		scan: Scans;
		issues: any[];
		summary: any;
	}>(`/scans/${scanId}/results`, {
		method: 'GET'
	});
};

export {
	getProjects,
	getProjectById,
	getDashboardAnalytics,
	deleteProject,
	getFileContent,
	getVulnerabilitiesForFile,
	createProject,
	uploadProjectZip,
	startScan,
	getScanStatus,
	getScanResults
};
