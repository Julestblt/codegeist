<script lang="ts">
	import type { Manifest, FileNode } from '$lib/types/api';
	import { buildTree } from '$lib/utils/file-explorer.utils';
	import { Button } from '../ui/button';
	import Node from './node.svelte';
	import { PanelLeftClose } from 'lucide-svelte';

	export let files: Manifest[] = [];
	export let selectedFileId: string | undefined = undefined;
	export let onFileSelect: (file: FileNode) => void;
	export let onTogglePanel: (() => void) | undefined = undefined;

	let expanded = new Set<string>();

	$: tree = buildTree(files);

	$: if (tree.length === 1 && tree[0].type === 'folder') {
		expanded.add(tree[0].id);
		expanded = expanded;
	}

	const toggle = (id: string) => {
		expanded.has(id) ? expanded.delete(id) : expanded.add(id);
		expanded = expanded;
	};
</script>

<div class="flex h-full flex-col">
	<div class="flex-shrink-0 border-b p-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">Files</h3>
			{#if onTogglePanel}
				<Button variant="ghost" onclick={onTogglePanel} title="Rétracter l'explorateur de fichiers">
					<PanelLeftClose />
				</Button>
			{/if}
		</div>
	</div>

	<div class="flex-1 overflow-y-auto">
		<div class="space-y-1 truncate p-2">
			{#each tree as n (n.id)}
				<Node node={n} {expanded} {selectedFileId} {onFileSelect} {toggle} />
			{/each}
		</div>
	</div>
</div>
