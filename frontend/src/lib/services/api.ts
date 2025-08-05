import type { DashboardAnalytics, Project, Scans, Vulnerability } from '$lib/types/api';
import { PUBLIC_API_URL } from '$env/static/public';
import { authService } from './auth.service';

const API_BASE = PUBLIC_API_URL + '/api/v1';
console.log('API_BASE', API_BASE);

let isAuthenticating = false;

const apiRequest = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
	await authService.init();

	await authService.refreshToken();

	const token = authService.getToken();
	console.log('Envoi de la requête avec token:', token ? 'présent' : 'absent', 'vers:', endpoint);

	const headers = {
		...options.headers,
		...(token && { Authorization: `Bearer ${token}` })
	};

	console.log('Headers envoyés:', headers);

	const response = await fetch(`${API_BASE}${endpoint}`, {
		...options,
		headers
	});

	const status = response.status;
	console.log('Réponse reçue:', status, 'pour:', endpoint);

	if (status === 403 || status === 401) {
		if (!authService.isAuthenticated() && !isAuthenticating) {
			console.log('Non authentifié, redirection vers Keycloak...');
			isAuthenticating = true;
			try {
				await authService.login();
			} finally {
				isAuthenticating = false;
			}
		}
		throw new Error('Unauthorized');
	}

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
	await authService.init();

	await authService.refreshToken();

	const token = authService.getToken();
	const headers: HeadersInit = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const res = await fetch(
		`${API_BASE}/projects/${projectId}/file?path=${encodeURIComponent(filePath)}`,
		{ headers }
	);

	if (res.status === 403 || res.status === 401) {
		await authService.login();
		throw new Error('Unauthorized');
	}

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
		issues: unknown[];
		summary: unknown;
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
	getScanResults,
	authService
};
