import React from "react";
import { Calendar, FileText, HardDrive, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getTotalVulnerabilities = () => project.analysis?.summary.total || 0;
  const getCriticalVulnerabilities = () =>
    project.analysis?.summary.critical || 0;

  const getStatusVariant = ():
    | "default"
    | "secondary"
    | "destructive"
    | "outline" => {
    switch (project.status) {
      case "completed":
        return "secondary";
      case "analyzing":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card
      className="shadow-sm hover:shadow-lg hover:border-primary transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect(project)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Badge
              variant={"secondary"}
              className="w-12 h-12 flex items-center justify-center p-3"
            >
              <FolderOpen className="!h-full !w-full" />
            </Badge>
            <div>
              <h3 className="font-semibold truncate max-w-32 transition-colors">
                {project.name}
              </h3>
              <Badge variant={getStatusVariant()}>
                <span className="capitalize">
                  {project.status === "completed"
                    ? "Completed"
                    : project.status === "analyzing"
                    ? "Analyzing"
                    : "Error"}
                </span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(project.uploadDate)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="w-4 h-4 mr-2" />
            {project.fileCount} files
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <HardDrive className="w-4 h-4 mr-2" />
            {formatFileSize(project.size)}
          </div>
        </div>

        {project.analysis && (
          <div className="pt-4 border-t border-muted-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold">
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
                <div className="text-xs text-slate-500">Coverage</div>
              </div>
            </div>
          </div>
        )}

        {project.status === "analyzing" && (
          <div className="w-full mt-4">
            <p className="text-sm text-muted-foreground mb-1">Analyzing...</p>
            <div className="h-1.5 w-full bg-muted overflow-hidden rounded">
              <div className="progress w-full h-full bg-primary left-right"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
