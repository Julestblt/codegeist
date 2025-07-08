import { readdir } from "node:fs/promises";
import path from "node:path";

export interface ManifestNode {
  path: string;
  isDir: boolean;
  size: number;
}

const buildManifest = async (
  root: string
): Promise<{
  manifest: ManifestNode[];
  totalSize: number;
}> => {
  const list: ManifestNode[] = [];
  let total = 0;

  async function walk(dir: string) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const entries = await readdir(dir, { withFileTypes: true });

      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        try {
          const rel = path.relative(root, full);
          if (ent.isDirectory()) {
            list.push({ path: rel, isDir: true, size: 0 });
            await walk(full);
          } else {
            const file = Bun.file(full);
            const exists = await file.exists();
            if (exists) {
              const { size } = await file.stat();
              list.push({ path: rel, isDir: false, size });
              total += size;
            }
          }
        } catch (error) {
          console.log(`❌ Error processing ${full}:`, error);
        }
      }
    } catch (error) {
      console.log(`❌ Error reading directory ${dir}:`, error);
    }
  }
  await walk(root);
  return { manifest: list, totalSize: total };
};

export { buildManifest };
