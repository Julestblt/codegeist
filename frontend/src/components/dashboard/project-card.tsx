import React from "react";
import {
  Calendar,
  FileText,
  HardDrive,
  FolderOpen,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/services/api";
import { useProjectContext } from "@/contexts/project-context";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const { deleteProject } = useProjectContext();

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-EN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      await deleteProject(projectId);
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  return (
    <Card
      className="shadow-sm hover:shadow-lg hover:border-primary cursor-pointer group"
      onClick={() => onSelect(project)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-3 w-full">
              <Badge
                variant={"secondary"}
                className="w-12 h-12 flex items-center justify-center p-3"
              >
                <FolderOpen className="!h-full !w-full" />
              </Badge>
              <h3 className="font-semibold">{project.name}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant={"outline"}>
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost">Delete Project</Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your project and remove all its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                          Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                          className="text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(e, project.id);
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(project.createdAt)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="w-4 h-4 mr-2" />
            {project.totalFiles} files
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <HardDrive className="w-4 h-4 mr-2" />
            {formatFileSize(project.totalSize as number)}
          </div>
        </div>
        {/* {project.analysis && (
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
        )} */}
        {/* {project.status === "analyzing" && (
          <div className="w-full mt-4">
            <p className="text-sm text-muted-foreground mb-1">Analyzing...</p>
            <div className="h-1.5 w-full bg-muted overflow-hidden rounded">
              <div className="progress w-full h-full bg-primary left-right"></div>
            </div>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
