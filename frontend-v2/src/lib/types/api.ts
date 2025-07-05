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

export interface Issue {
	id: string;
	scanId: string;
	projectId: string;
	severity: string;
	description: string;
	recommendation: string;
	filePath: string;
	lines: number[];
	type: string;
	cwe: string | null;
}

export interface Vulnerability {
	id: string;
	scanId: string;
	projectId: string;
	filePath: string;
	lines: number[];
	type: string;
	severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
	description: string;
	recommendation: string;
	cwe?: string | null;
}

export interface Scans {
	id: string;
	status: 'queued' | 'running' | 'completed' | 'failed';
	progress: number;
	startedAt?: string;
	finishedAt?: string;
	results?: Record<string, any>;
	issues?: Issue[];
}

export interface DashboardAnalytics {
	totalProjectsAnalyzed: number;
	totalIssues: number;
	critical: number;
}
