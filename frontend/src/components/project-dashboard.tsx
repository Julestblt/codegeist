import React from 'react';
import { 
  FolderOpen, 
  CheckCircle,
  AlertTriangle,
  Shield,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';
import type { Project } from '@/types';
import StatsCard from './dashboard/stats-card';
import ProjectCard from './dashboard/project-card';

interface ProjectDashboardProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onProjectSelect }) => {
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalVulnerabilities = projects.reduce((sum, p) => sum + (p.analysis?.summary.total || 0), 0);
  const criticalVulnerabilities = projects.reduce((sum, p) => sum + (p.analysis?.summary.critical || 0), 0);

  if (projects.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <FolderOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Welcome to CodeGeist</h3>
          <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
            Start your security journey by uploading your first code project. Our AI will analyze it to detect vulnerabilities and provide detailed insights.
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
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Security Dashboard</h2>
              <p className="text-slate-600">Monitor and analyze your code repositories for security vulnerabilities</p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Live Monitoring</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Projects"
              value={totalProjects}
              icon={FolderOpen}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
            />
            <StatsCard
              title="Analysés"
              value={completedProjects}
              icon={CheckCircle}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-100"
            />
            <StatsCard
              title="Total Issues"
              value={totalVulnerabilities}
              icon={AlertTriangle}
              iconColor="text-orange-600"
              iconBg="bg-orange-100"
            />
            <StatsCard
              title="Critical"
              value={criticalVulnerabilities}
              icon={Shield}
              iconColor="text-red-600"
              iconBg="bg-red-100"
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