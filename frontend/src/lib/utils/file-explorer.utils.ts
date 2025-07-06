import type { Manifest, FileNode } from '$lib/types/api';

function sortNodes(a: FileNode, b: FileNode): number {
	if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
	return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}

export function buildTree(manifest: Manifest[]): FileNode[] {
	const root: Record<string, FileNode> = {};

	manifest.forEach((m) => {
		const parts = m.path.split('/');
		let lvl = root;
		let accPath = '';

		parts.forEach((seg, idx) => {
			accPath = accPath ? `${accPath}/${seg}` : seg;
			const last = idx === parts.length - 1;
			if (!lvl[seg]) {
				lvl[seg] = {
					id: accPath,
					name: seg,
					type: last ? (m.isDir ? 'folder' : 'file') : 'folder',
					size: last ? m.size : 0,
					extension: last && !m.isDir ? seg.split('.').pop() : undefined,
					children: {}
				} as unknown as FileNode;
			}
			if (!last) lvl = (lvl[seg] as FileNode).children as any;
		});
	});

	const objToArr = (o: Record<string, FileNode>): FileNode[] =>
		Object.values(o)
			.map((node) =>
				node.type === 'folder' ? { ...node, children: objToArr(node.children as any) } : node
			)
			.sort(sortNodes);

	return objToArr(root);
}

export const fmtSize = (b: number): string => (b ? `${Math.round(b / 102.4) / 10} KB` : '');
