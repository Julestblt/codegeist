import { useState, useEffect } from "react";
import type { Project } from "@/types";
import { mockProjects } from "@/data/mock-data";

const STORAGE_KEY = "codegeist-projects";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedProjects = JSON.parse(stored).map((p: any) => ({
          ...p,
          uploadDate: new Date(p.uploadDate),
          analysis: p.analysis
            ? {
                ...p.analysis,
                timestamp: new Date(p.analysis.timestamp),
              }
            : undefined,
        }));
        setProjects(parsedProjects);
      } catch (error) {
        console.error("Failed to load projects:", error);
        setProjects(mockProjects);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProjects));
      }
    } else {
      setProjects(mockProjects);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProjects));
    }
  }, []);

  const addProject = (project: Project) => {
    const newProjects = [...projects, project];
    setProjects(newProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const newProjects = projects.map((p) =>
      p.id === projectId ? { ...p, ...updates } : p
    );
    setProjects(newProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
  };

  const deleteProject = (projectId: string) => {
    const newProjects = projects.filter((p) => p.id !== projectId);
    setProjects(newProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
  };
};
