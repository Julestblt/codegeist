import JSZip from "jszip";
import type { FileNode, Project } from "@/types";

export const processZipFile = async (file: File): Promise<Project> => {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);

  const fileMap = new Map<string, FileNode>();

  for (const [path, zipEntry] of Object.entries(contents.files)) {
    if (zipEntry.dir) continue;

    const content = await zipEntry.async("text");
    const pathParts = path.split("/").filter(Boolean);
    const fileName = pathParts[pathParts.length - 1];
    const extension = fileName.split(".").pop()?.toLowerCase();

    const fileNode: FileNode = {
      id: generateId(),
      name: fileName,
      type: "file",
      path,
      content,
      size: content.length,
      extension,
    };

    fileMap.set(path, fileNode);

    let currentPath = "";
    for (let i = 0; i < pathParts.length - 1; i++) {
      const folderName = pathParts[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

      if (!fileMap.has(currentPath + "/")) {
        const folderNode: FileNode = {
          id: generateId(),
          name: folderName,
          type: "folder",
          path: currentPath,
          children: [],
        };
        fileMap.set(currentPath + "/", folderNode);
      }
    }
  }

  const rootNodes: FileNode[] = [];
  const allNodes = Array.from(fileMap.values());

  for (const node of allNodes) {
    const pathParts = node.path.split("/").filter(Boolean);

    if (pathParts.length === 1) {
      rootNodes.push(node);
    } else {
      const parentPath = pathParts.slice(0, -1).join("/") + "/";
      const parent = fileMap.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    }
  }

  const project: Project = {
    id: generateId(),
    name: file.name.replace(".zip", ""),
    uploadDate: new Date(),
    fileCount: Array.from(fileMap.values()).filter((n) => n.type === "file")
      .length,
    size: file.size,
    status: "analyzing",
    files: rootNodes,
  };

  return project;
};

export const findFileById = (
  files: FileNode[],
  id: string
): FileNode | null => {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const findFileByPath = (
  files: FileNode[],
  path: string
): FileNode | null => {
  for (const file of files) {
    if (file.path === path) return file;
    if (file.children) {
      const found = findFileByPath(file.children, path);
      if (found) return found;
    }
  }
  return null;
};

const generateId = () => Math.random().toString(36).substr(2, 9);
