export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileNode[];
  size?: number;
  extension?: string;
}

export interface Project {
  id: string;
  name: string;
  uploadDate: Date;
  fileCount: number;
  size: number;
  status: "analyzing" | "completed" | "error";
  files: FileNode[];
  analysis?: AnalysisResult;
  gitUrl?: string;
}

export interface Vulnerability {
  id: string;
  type: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  file: string;
  line: number;
  column?: number;
  code: string;
  recommendation: string;
  cweId?: string;
}

export interface AnalysisResult {
  id: string;
  projectId: string;
  timestamp: Date;
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  coverage: {
    filesAnalyzed: number;
    totalFiles: number;
    percentage: number;
  };
}
