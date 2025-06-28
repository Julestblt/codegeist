import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectHeader from "@/components/layout/project-header";
import FileExplorer from "@/components/file-explorer";
import CodeViewer from "@/components/code-viewer";
import AnalysisPanel from "@/components/analysis-panel";
import { getProject } from "@/services/api";
import { findFileByPath } from "@/utils/file-processor";
import type { Manifest, Project } from "@/services/api";
import type { FileNode, Vulnerability } from "@/types";

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      setLoading(true);
      try {
        const p = await getProject(projectId);
        setProject(p);
      } catch (e) {
        setError("Project not found");
        navigate("/project/create");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, navigate]);

  const handleFileSelect = (file: FileNode) => setSelectedFile(file);

  const handleVulnSelect = (v: Vulnerability) => {
    if (!project) return;
    const file = findFileByPath(project.manifest as Manifest[], v.file);
    if (file) setSelectedFile(file);
  };

  if (loading) return <p className="p-8">Loading…</p>;
  if (error || !project) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ProjectHeader project={project} />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-80 border-r flex-shrink-0 overflow-hidden flex flex-col">
          <FileExplorer
            files={project.manifest as Manifest[]}
            selectedFileId={selectedFile?.id}
            onFileSelect={handleFileSelect}
          />
        </div>

        <div className="flex-1 border-r border-muted overflow-hidden flex flex-col">
          <CodeViewer
            file={selectedFile}
            vulnerabilities={(project as any).analysis?.vulnerabilities ?? []}
            path={selectedFile?.id || null}
            projectId={project.id}
          />
        </div>

        <div className="w-96 flex-shrink-0 overflow-hidden flex flex-col">
          <AnalysisPanel
            analysis={(project as any).analysis ?? null}
            onVulnerabilitySelect={handleVulnSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
