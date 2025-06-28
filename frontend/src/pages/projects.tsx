import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "@/contexts/project-context";
import FileUploader from "@/components/file-uploader";
import type { Project } from "@/services/api";

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useProjectContext();

  useEffect(() => {
    document.title = "CodeGeist - Create Project";
  });

  const handleProjectUpload = async (project: Project) => {
    addProject(project);
    navigate(`/`);
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <FileUploader onUpload={handleProjectUpload} />
    </div>
  );
};

export default ProjectsPage;
