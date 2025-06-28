import type { Project } from "@/services/api";
import { format } from "date-fns";

interface ProjectHeaderProps {
  project: Project;
}

const kb = (bytes: number | undefined) =>
  bytes ? `${Math.round(bytes / 1024)} KB` : "—";

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const uploaded = project.createdAt
    ? format(new Date(project.createdAt), "yyyy-MM-dd HH:mm")
    : "—";

  return (
    <header className="border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold ">{project.name}</h2>

          <p className="text-sm text-muted-foreground">
            {project.totalFiles ?? 0} files · {kb(project.totalSize)} ·
            Uploaded&nbsp;
            {uploaded}
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

        {/* {project.analysis && (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            {project.analysis.summary.total} issues (
            {project.analysis.summary.critical} critical)
          </Badge>
        )} */}
      </div>
    </header>
  );
};
export default ProjectHeader;
