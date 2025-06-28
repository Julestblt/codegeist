import React from "react";
import { Upload, FileArchive, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";

interface FileDropZoneProps {
  isDragging: boolean;
  isProcessing: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileSelect: () => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  isDragging,
  isProcessing,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
}) => {
  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
        isDragging
          ? "border-primary bg-blue-50"
          : "border-gray-300 hover:border-primary"
      } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onFileSelect}
    >
      <div className="relative space-y-8">
        <Badge className="w-24 h-24 p-6" variant={"secondary"}>
          <FileArchive className="!w-full !h-full" />
        </Badge>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Upload Your Project</h3>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Drag and drop a ZIP file containing your project, or click to browse
          </p>

          <div className="pt-4">
            <Button variant="secondary" size="lg" onClick={onFileSelect}>
              <Upload className="w-5 h-5 mr-3" />
              Select ZIP file
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground text-left">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileArchive className="w-4 h-4 text-green-600" />
            </div>
            <span>ZIP Archives supported</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <span>Up to 100MB</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Github className="w-4 h-4 text-purple-600" />
            </div>
            <span>Git Integration</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDropZone;
