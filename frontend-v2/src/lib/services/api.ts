import type { DashboardAnalytics, Project } from '$lib/types/api';

const API_BASE = 'http://localhost:3000/api/v1';

const apiRequest = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
	const response = await fetch(`${API_BASE}${endpoint}`, {
		...options,
		headers: {
			...options.headers
		}
	});

	if (!response.ok) {
		throw new Error(`Error fetching ${endpoint}: ${response.statusText}`);
	}

	return await response.json();
};

const getProjects = () =>
	apiRequest<{ projects: Project[] }>('/projects', {}).then((d) => d.projects);

const getDashboardAnalytics = () =>
	apiRequest<DashboardAnalytics>('/scans/dashboard/analytics').then((d) => d);

const deleteProject = (projectId: string) =>
	apiRequest<{ status: boolean }>(`/projects/${projectId}`, {
		method: 'DELETE'
	});

export { getProjects, getDashboardAnalytics, deleteProject };
