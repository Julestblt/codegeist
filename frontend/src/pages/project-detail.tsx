import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectHeader from "@/components/layout/project-header";
import FileExplorer from "@/components/file-explorer";
import CodeViewer from "@/components/code-viewer";
import AnalysisPanel from "@/components/analysis-panel";
import { getProject } from "@/services/api";

import type { Manifest, Project, Scans } from "@/services/api";
import type { FileNode, Vulnerability } from "@/types";

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = `CodeGeist - ${project?.name || ""}`;

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

    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }
    };
  }, [projectId, navigate, project?.name]);

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    setHighlightLine(null);

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  };

  const handleVulnSelect = (v: Vulnerability) => {
    if (!project || !project.manifest) return;

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }

    const manifestFile = project.manifest.find((f) => f.path === v.file);

    if (manifestFile) {
      const fileNode: FileNode = {
        id: manifestFile.path,
        name: manifestFile.path.split("/").pop() || manifestFile.path,
        type: "file",
        path: manifestFile.path,
        size: manifestFile.size,
        extension: manifestFile.path.split(".").pop(),
      };

      setSelectedFile(fileNode);
      setHighlightLine(v.line);

      highlightTimerRef.current = setTimeout(() => {
        setHighlightLine(null);
        highlightTimerRef.current = null;
      }, 1500);
    }
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
            path={selectedFile?.id || null}
            projectId={project.id}
            highlightLine={highlightLine}
          />
        </div>

        <div className="w-96 flex-shrink-0 overflow-hidden flex flex-col">
          <AnalysisPanel
            onVulnerabilitySelect={handleVulnSelect}
            scans={project.scans as Scans[]}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
