import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { listProjects } from "@/services/api";
import type { Project } from "@/services/api";

interface ProjectCtx {
  projects: Project[];
  refresh: () => Promise<void>;
  addProject: (p: Project) => void;
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

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Ctx.Provider value={{ projects, refresh, addProject }}>
      {children}
    </Ctx.Provider>
  );
};

export const useProjectContext = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ProjectProvider missing");
  return ctx;
};
