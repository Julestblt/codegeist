import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectContext } from "@/contexts/project-context";
import ProjectHeader from "@/components/layout/project-header";
import FileExplorer from "@/components/file-explorer";
import CodeViewer from "@/components/code-viewer";
import AnalysisPanel from "@/components/analysis-panel";
import { analyzeCode } from "@/utils/code-analyser";
import { findFileByPath } from "@/utils/file-processor";
import type { FileNode, Vulnerability } from "@/types";

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjectContext();

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!currentProject) {
      navigate("/project/create");
      return;
    }

    if (currentProject.status === "analyzing") {
      handleAnalyzeProject();
    }
  }, [currentProject, navigate]);

  const handleAnalyzeProject = async () => {
    if (!currentProject || isAnalyzing) return;

    setIsAnalyzing(true);
    updateProject(currentProject.id, { status: "analyzing" });

    try {
      const analysis = await analyzeCode(currentProject);
      updateProject(currentProject.id, {
        status: "completed",
        analysis,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      updateProject(currentProject.id, { status: "error" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
  };

  const handleVulnerabilitySelect = (vulnerability: Vulnerability) => {
    if (currentProject) {
      const file = findFileByPath(currentProject.files, vulnerability.file);
      if (file) {
        setSelectedFile(file);
      }
    }
  };

  if (!currentProject) {
    return null;
  }

  return (
    <>
      <ProjectHeader
        project={currentProject}
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyzeProject}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <FileExplorer
            files={currentProject.files}
            selectedFileId={selectedFile?.id}
            onFileSelect={handleFileSelect}
          />
        </div>

        <div className="flex-1 bg-white border-r border-gray-200">
          <CodeViewer
            file={selectedFile}
            vulnerabilities={currentProject.analysis?.vulnerabilities || []}
          />
        </div>

        <div className="w-96 bg-white flex-shrink-0">
          <AnalysisPanel
            analysis={currentProject.analysis || null}
            onVulnerabilitySelect={handleVulnerabilitySelect}
          />
        </div>
      </div>
    </>
  );
};

export default ProjectDetailPage;
