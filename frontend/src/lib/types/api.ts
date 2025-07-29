export interface Manifest {
	path: string;
	size: number;
	isDir: boolean;
}

export interface FileNode {
	id: string;
	name: string;
	type: 'file' | 'folder';
	size: number;
	extension?: string;
	children?: FileNode[];
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
	severity: Severity;
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
	results?: Record<string, unknown>;
	issues?: Issue[];
}

export interface DashboardAnalytics {
	totalProjectsAnalyzed: number;
	totalIssues: number;
	critical: number;
}

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
