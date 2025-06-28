import React from 'react';
import { Play, AlertCircle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/';

interface ProjectHeaderProps {
  project: Project;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, isAnalyzing, onAnalyze }) => {
  const getStatusBadge = () => {
    switch (project.status) {
      case 'analyzing':
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            <Activity className="w-4 h-4 mr-2 animate-pulse" />
            Analyzing...
          </Badge>
        );
      case 'completed':
        return project.analysis && (
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {project.analysis.summary.total} issues found
              </span>
              <span className="text-gray-600 ml-2">
                ({project.analysis.summary.critical} critical)
              </span>
            </div>
          </div>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-4 h-4 mr-2" />
            Analysis failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
          <p className="text-sm text-gray-600">
            {project.fileCount} files • Uploaded on {project.uploadDate.toLocaleDateString('en-US')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge()}
          
          {project.status === 'completed' && (
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              size="default"
            >
              <Play className="w-4 h-4 mr-2" />
              Re-analyze
            </Button>
          )}
          
          {project.status === 'error' && (
            <Button
              onClick={onAnalyze}
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;