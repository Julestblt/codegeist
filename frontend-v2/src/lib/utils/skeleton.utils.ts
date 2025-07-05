import type { Project, DashboardAnalytics } from '$lib/types/api';

export function createSkeletonProjects(count: 1): Project;
export function createSkeletonProjects(count: number): Project[];
export function createSkeletonProjects(count: number = 6): Project | Project[] {
	const generateProject = (index: number): Project => ({
		id: `skeleton-${index}`,
		name: 'Project Name Placeholder',
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		totalFiles: 123,
		totalSize: 45678,
		url: 'https://github.com/example/repository-name'
	});

	if (count === 1) {
		return generateProject(0);
	}

	return Array(count)
		.fill(null)
		.map((_, index) => generateProject(index));
}

export function createSkeletonProject(id?: string): Project {
	return {
		id: id || 'skeleton-project',
		name: 'Loading Project Name Placeholder',
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		totalFiles: 123,
		totalSize: 45678,
		url: 'https://github.com/example/repository-name'
	};
}

export function createSkeletonDashboardAnalytics(): DashboardAnalytics {
	return {
		totalProjectsAnalyzed: 42,
		totalIssues: 156,
		critical: 8
	};
}

export const SkeletonUtils = {
	randomInt: (min: number = 1, max: number = 999): number => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	randomRecentDate: (): string => {
		const now = new Date();
		const daysAgo = Math.floor(Math.random() * 30); // 0-30 jours
		const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
		return date.toISOString();
	},

	randomProjectName: (): string => {
		const prefixes = ['Project', 'App', 'Service', 'API', 'Dashboard', 'Client'];
		const suffixes = ['Manager', 'System', 'Tool', 'Platform', 'Engine', 'Core'];
		const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
		const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
		return `${prefix} ${suffix}`;
	}
} as const;
