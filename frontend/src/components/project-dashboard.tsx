import React from "react";
import {
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  Shield,
  Zap,
  TrendingUp,
  Activity,
} from "lucide-react";
import type { Project } from "@/services/api";
import { StatsCard, ProjectCard } from "./dashboard/";
import { Badge } from "./ui/badge";

interface ProjectDashboardProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  onProjectSelect,
}) => {
  const totalProjects = projects.length;
  // const completedProjects = projects.filter(
  //   (p) => p.status === "completed"
  // ).length;
  // const totalVulnerabilities = projects.reduce(
  //   (sum, p) => sum + (p.analysis?.summary.total || 0),
  //   0
  // );
  // const criticalVulnerabilities = projects.reduce(
  //   (sum, p) => sum + (p.analysis?.summary.critical || 0),
  //   0
  // );

  if (projects.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center">
            <FolderOpen className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Welcome to CodeGeist
          </h3>
          <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
            Start your security journey by uploading your first code project.
            Our AI will analyze it to detect vulnerabilities and provide
            detailed insights.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-1" />
              AI Analysis
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Security Focused
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Detailed Reports
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Security Dashboard</h2>
              <p className="text-slate-500">
                Monitor and analyze your code repositories for security
                vulnerabilities
              </p>
            </div>
            <Badge className="py-2 px-4 select-none" variant={"outline"}>
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Live Monitoring</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Projects"
              value={totalProjects}
              icon={FolderOpen}
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Analyzed"
              // value={completedProjects}
              icon={CheckCircle}
              iconColor="text-emerald-600"
            />
            <StatsCard
              title="Total Issues"
              // value={totalVulnerabilities}
              icon={AlertTriangle}
              iconColor="text-yellow-600"
            />
            <StatsCard
              title="Critical"
              // value={criticalVulnerabilities}
              icon={Shield}
              iconColor="text-red-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onProjectSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
