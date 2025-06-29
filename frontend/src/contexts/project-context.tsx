import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  listProjects,
  deleteProject as apiDeleteProject,
} from "@/services/api";
import type { Project } from "@/services/api";

interface ProjectCtx {
  projects: Project[];
  refresh: () => Promise<void>;
  addProject: (p: Project) => void;
  deleteProject: (projectId: string) => Promise<{ status: boolean }>;
}

const Ctx = createContext<ProjectCtx | null>(null);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  const refresh = async () => {
    try {
      setProjects(await listProjects());
    } catch (e) {
      console.error("Cannot fetch projects:", e);
    }
  };

  const addProject = (p: Project) => setProjects((prev) => [...prev, p]);

  const deleteProject = async (projectId: string) => {
    try {
      await apiDeleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return { status: true };
    } catch (e) {
      console.error("Failed to delete project:", e);
      throw e;
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Ctx.Provider value={{ projects, refresh, addProject, deleteProject }}>
      {children}
    </Ctx.Provider>
  );
};

export const useProjectContext = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ProjectProvider missing");
  return ctx;
};
