import { startScan, type Project } from "@/services/api";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Radar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProjectHeaderProps {
  project: Project;
}

const kb = (bytes: number | undefined) =>
  bytes ? `${Math.round(bytes / 1024)} KB` : "0 KB";

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const [scanStatus, setScanStatus] = useState<
    "queued" | "running" | "completed" | "failed" | null
  >(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const uploadedAt = new Date(project.createdAt ?? 0);

  const startScanHandler = async () => {
    const { id } = project;

    const response = await startScan(id);

    if (response.scan.status === "queued") {
      setScanStatus(response.scan.status);
      setScanId(response.scan.id);
      toast.success("Scan started successfully!");
    }
  };

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
        {scanStatus === "running" ? (
          <span className="text-sm text-yellow-500 font-semibold">
            Scan in progress...
          </span>
        ) : scanStatus === null ? (
          <Button
            onClick={startScanHandler}
            size="lg"
            className="text-white font-semibold"
          >
            <Radar className="w-4 h-4 mr-1 " />
            Analyze
          </Button>
        ) : (
          <span className="text-sm text-green-500 font-semibold">
            Scan {scanStatus}
          </span>
        )}
      </div>
    </header>
  );
};
export default ProjectHeader;
