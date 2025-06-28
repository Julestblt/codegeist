import  { useState } from 'react';
import Header from './components/layout/header';
import ProjectHeader from './components/layout/project-header';
import ProjectDashboard from './components/project-dashboard';
import FileUploader from './components/file-uploader';
import FileExplorer from './components/file-explorer';
import CodeViewer from './components/code-viewer';
import AnalysisPanel from './components/analysis-panel';
import { useProjects } from './hooks/use-projects';
import { analyzeCode } from './utils/code-analyser';
import { findFileByPath } from './utils/file-processor';
import type { FileNode, Vulnerability, Project } from '@/types';

function App() {
  const { projects, addProject, updateProject } = useProjects();
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects'>('dashboard');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleProjectUpload = async (project: Project) => {
    addProject(project);
    setCurrentProject(project);
    setCurrentView('projects');
    
    setTimeout(() => {
      handleAnalyzeProject(project);
    }, 1000);
  };

  const handleAnalyzeProject = async (project: Project) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    updateProject(project.id, { status: 'analyzing' });
    
    try {
      const analysis = await analyzeCode(project);
      updateProject(project.id, { 
        status: 'completed',
        analysis 
      });
      
      if (currentProject?.id === project.id) {
        setCurrentProject({ ...project, status: 'completed', analysis });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      updateProject(project.id, { status: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
  };

  const handleVulnerabilitySelect = (vulnerability: Vulnerability) => {
    if (currentProject) {
      const file = findFileByPath(currentProject.files, vulnerability.file);
      if (file) {
        setSelectedFile(file);
      }
    }
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('projects');
    setSelectedFile(null);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as 'dashboard' | 'projects');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentView={currentView} onViewChange={handleViewChange} />
      
      {currentView === 'dashboard' ? (
        <div className="flex-1 overflow-hidden">
          <ProjectDashboard projects={projects} onProjectSelect={handleProjectSelect} />
        </div>
      ) : !currentProject ? (
        <div className="flex-1 flex items-center justify-center">
          <FileUploader onUpload={handleProjectUpload} />
        </div>
      ) : (
        <>
          <ProjectHeader 
            project={currentProject}
            isAnalyzing={isAnalyzing}
            onAnalyze={() => handleAnalyzeProject(currentProject)}
          />

          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
              <FileExplorer
                files={currentProject.files}
                selectedFileId={selectedFile?.id}
                onFileSelect={handleFileSelect}
              />
            </div>

            <div className="flex-1 bg-white border-r border-gray-200">
              <CodeViewer
                file={selectedFile}
                vulnerabilities={currentProject.analysis?.vulnerabilities || []}
              />
            </div>

            <div className="w-96 bg-white flex-shrink-0">
              <AnalysisPanel
                analysis={currentProject.analysis || null}
                onVulnerabilitySelect={handleVulnerabilitySelect}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;