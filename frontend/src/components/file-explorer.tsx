import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";
import type { FileNode } from "@/types";

interface FileExplorerProps {
  files: FileNode[];
  selectedFileId?: string;
  onFileSelect: (file: FileNode) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedFileId,
  onFileSelect,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (extension?: string) => {
    const iconClass = "w-4 h-4";

    switch (extension) {
      case "js":
      case "jsx":
        return { component: File, class: `${iconClass} text-yellow-600` };
      case "ts":
      case "tsx":
        return { component: File, class: `${iconClass} text-blue-600` };
      case "html":
        return { component: File, class: `${iconClass} text-orange-600` };
      case "css":
      case "scss":
        return { component: File, class: `${iconClass} text-pink-600` };
      case "json":
        return { component: File, class: `${iconClass} text-green-600` };
      case "md":
        return { component: File, class: `${iconClass} text-gray-600` };
      default:
        return { component: File, class: `${iconClass} text-gray-500` };
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFileId === node.id;
    const paddingLeft = depth * 20 + 8;

    const FileIcon = getFileIcon(node.extension);

    return (
      <div key={node.id}>
        <div
          className={`flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-md transition-colors ${
            isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700"
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.id);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === "folder" && (
            <div className="w-4 h-4 mr-1 flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </div>
          )}

          <div className="w-4 h-4 mr-2 flex-shrink-0">
            {node.type === "folder" ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500" />
              )
            ) : (
              <FileIcon.component className={FileIcon.class} />
            )}
          </div>

          <span className="text-sm font-medium truncate">{node.name}</span>

          {node.type === "file" && node.size && (
            <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>

        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Files</h3>
      </div>
      <div className="p-2 space-y-1">
        {files.map((file) => renderNode(file))}
      </div>
    </div>
  );
};

export default FileExplorer;
