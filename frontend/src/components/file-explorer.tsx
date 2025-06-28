import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";
import type { FileNode } from "@/types";

interface ManifestEntry {
  path: string;
  size: number;
  isDir: boolean;
}

function sortNodes(a: FileNode, b: FileNode) {
  if (a.type !== b.type) return a.type === "folder" ? -1 : 1; // dossiers d'abord
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function buildTree(manifest: ManifestEntry[]): FileNode[] {
  const root: Record<string, FileNode> = {};

  manifest.forEach((m) => {
    const parts = m.path.split("/");
    let lvl = root;
    let accPath = "";

    parts.forEach((seg, idx) => {
      accPath = accPath ? `${accPath}/${seg}` : seg;
      const last = idx === parts.length - 1;
      if (!lvl[seg]) {
        lvl[seg] = {
          id: accPath,
          name: seg,
          type: last ? (m.isDir ? "folder" : "file") : "folder",
          size: last ? m.size : 0,
          extension: last && !m.isDir ? seg.split(".").pop() : undefined,
          children: {},
        } as unknown as FileNode;
      }
      if (!last) lvl = (lvl[seg] as FileNode).children!;
    });
  });

  const objToArr = (o: Record<string, FileNode>): FileNode[] =>
    Object.values(o)
      .map((node) =>
        node.type === "folder"
          ? { ...node, children: objToArr(node.children!) }
          : node
      )
      .sort(sortNodes);

  return objToArr(root);
}

interface FileExplorerProps {
  files: ManifestEntry[];
  selectedFileId?: string;
  onFileSelect: (file: FileNode) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedFileId,
  onFileSelect,
}) => {
  const tree = useMemo(() => buildTree(files), [files]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const icon = () => {
    return { component: File };
  };

  const fmtSize = (b: number) => (b ? `${Math.round(b / 102.4) / 10} KB` : "");

  const renderNode = (n: FileNode, depth = 0): React.ReactNode => {
    const indent = depth * 20 + 8;
    const isDir = n.type === "folder";
    const isOpen = expanded.has(n.id);
    const isSel = selectedFileId === n.id;
    const FileIcon = icon();

    return (
      <div key={n.id}>
        <div
          className={`flex items-center px-2 py-1.5 cursor-pointer rounded-md transition-colors
            ${isSel ? "bg-primary text-foreground" : "hover:bg-muted"}`}
          style={{ paddingLeft: indent }}
          onClick={() => (isDir ? toggle(n.id) : onFileSelect(n))}
        >
          {isDir && (
            <div className="w-4 h-4 mr-1 flex-shrink-0">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          )}

          <div className="w-4 h-4 mr-2 flex-shrink-0">
            {isDir ? (
              isOpen ? (
                <FolderOpen className="w-4 h-4 text-primary" />
              ) : (
                <Folder className="w-4 h-4 text-primary" />
              )
            ) : (
              <FileIcon.component className="w-4 h-4" />
            )}
          </div>

          <span className="text-sm truncate">{n.name}</span>

          {!isDir && n.size && (
            <span className="text-xs ml-auto">{fmtSize(n.size)}</span>
          )}
        </div>

        {isDir && isOpen && n.children && (
          <div>{n.children.map((c) => renderNode(c, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <h3 className="text-lg font-semibold">Files</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">{tree.map((n) => renderNode(n))}</div>
      </div>
    </div>
  );
};

export default FileExplorer;
