import { readdir } from "node:fs/promises";
import path from "node:path";

export interface ManifestNode {
  path: string;
  isDir: boolean;
  size: number;
}

const buildManifest = async (root: string): Promise<ManifestNode[]> => {
  const list: ManifestNode[] = [];
  async function walk(dir: string) {
    for (const ent of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      const rel = path.relative(root, full);
      if (ent.isDirectory()) {
        list.push({ path: rel, isDir: true, size: 0 });
        await walk(full);
      } else {
        const { size } = await Bun.file(full).stat();
        list.push({ path: rel, isDir: false, size });
      }
    }
  }
  await walk(root);
  return list;
};

export { buildManifest };
