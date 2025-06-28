import React, { createContext, useContext,  } from 'react';
import type { ReactNode } from 'react';
import { useProjects } from '@/hooks/use-projects';
import type { Project } from '@/types';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const projectsData = useProjects();

  return (
    <ProjectContext.Provider value={projectsData}>
      {children}
    </ProjectContext.Provider>
  );
};