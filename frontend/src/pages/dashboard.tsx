import React from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "@/contexts/project-context";
import ProjectDashboard from "@/components/project-dashboard";
import type { Project } from "@/types";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useProjectContext();

  const handleProjectSelect = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <ProjectDashboard
      projects={projects}
      onProjectSelect={handleProjectSelect}
    />
  );
};

export default DashboardPage;
