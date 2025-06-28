import React from 'react';
import { Calendar, FileText, HardDrive, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTotalVulnerabilities = () => project.analysis?.summary.total || 0;
  const getCriticalVulnerabilities = () => project.analysis?.summary.critical || 0;

  const getRiskLevel = () => {
    const critical = getCriticalVulnerabilities();
    const total = getTotalVulnerabilities();

    if (critical > 0) return { level: 'Critical', variant: 'destructive' as const };
    if (total > 5) return { level: 'High', variant: 'default' as const };
    if (total > 0) return { level: 'Medium', variant: 'secondary' as const };
    return { level: 'Faible', variant: 'outline' as const };
  };

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (project.status) {
      case 'completed': return 'default';
      case 'analyzing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const risk = getRiskLevel();

  return (
    <Card 
      className="shadow-sm border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect(project)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 truncate max-w-32 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <Badge variant={getStatusVariant()}>
                <span className="capitalize">{project.status === 'completed' ? 'Completed' : project.status === 'analyzing' ? 'Analyzing' : 'Error'}</span>
              </Badge>
            </div>
          </div>
          
          {project.analysis && (
            <Badge variant={risk.variant}>
              Risk {risk.level}
            </Badge>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(project.uploadDate)}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <FileText className="w-4 h-4 mr-2" />
            {project.fileCount} files
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <HardDrive className="w-4 h-4 mr-2" />
            {formatFileSize(project.size)}
          </div>
        </div>

        {project.analysis && (
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">
                    {getTotalVulnerabilities()}
                  </div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {getCriticalVulnerabilities()}
                  </div>
                  <div className="text-xs text-slate-500">Critical</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-emerald-600">
                  {project.analysis.coverage.percentage}%
                </div>
                <div className="text-xs text-slate-500">Couverture</div>
              </div>
            </div>
          </div>
        )}

        {project.status === 'analyzing' && (
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <span className="text-xs text-slate-600">Analyzing...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;