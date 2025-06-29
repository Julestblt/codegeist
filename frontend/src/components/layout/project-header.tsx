import type { Project } from "@/services/api";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Radar } from "lucide-react";

interface ProjectHeaderProps {
  project: Project;
}

const kb = (bytes: number | undefined) =>
  bytes ? `${Math.round(bytes / 1024)} KB` : "0 KB";

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const uploadedAt = new Date(project.createdAt ?? 0);

  return (
    <header className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold ">{project.name}</h2>

          <p className="text-sm text-muted-foreground">
            {project.totalFiles ?? 0} files · {kb(project.totalSize)} ·
            Uploaded&nbsp;at&nbsp;
            {format(uploadedAt, "dd/MM/yyyy HH:mm")}
          </p>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              {project.url.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <Button size="lg" className="text-white font-semibold">
          <Radar className="w-4 h-4 mr-1 " />
          Analyze
        </Button>
      </div>
    </header>
  );
};
export default ProjectHeader;
