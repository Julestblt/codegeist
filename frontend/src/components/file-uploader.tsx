import React, { useState, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { createProject, uploadProjectZip } from "@/services/api";
import type { Project } from "@/services/api";
import FileDropZone from "@/components/upload/file-drop-zone";
import ProjectConfigForm from "@/components/upload/project-config-form";

interface FileUploaderProps {
  onUpload: (project: Project) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, _] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [gitUrl, setGitUrl] = useState("");
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      setError("Please select a ZIP file containing your code");
      return;
    }

    setSelectedFile(file);
    setProjectName(file.name.replace(".zip", "").replace(/[-_]/g, " "));
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      const id = await createProject(projectName, gitUrl.trim() || null);
      const { project } = await uploadProjectZip(id, selectedFile);

      onUpload(project);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setProjectName("");
    setGitUrl("");
    setShowForm(false);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (showForm && selectedFile) {
    return (
      <ProjectConfigForm
        selectedFile={selectedFile}
        projectName={projectName}
        gitUrl={gitUrl}
        isProcessing={isProcessing}
        error={error}
        onProjectNameChange={setProjectName}
        onGitUrlChange={setGitUrl}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <FileDropZone
        isDragging={isDragging}
        isProcessing={isProcessing}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onFileSelect={openFileDialog}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileInput}
        className="hidden"
      />

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
