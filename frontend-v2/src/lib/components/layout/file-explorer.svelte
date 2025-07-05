<script lang="ts">
	import type { Manifest, FileNode } from '$lib/types/api';
	import { buildTree } from '$lib/utils/file-explorer.utils';
	import Node from './node.svelte';

	export let files: Manifest[] = [];
	export let selectedFileId: string | undefined = undefined;
	export let onFileSelect: (file: FileNode) => void;

	let expanded = new Set<string>();

	$: tree = buildTree(files);

	const toggle = (id: string) => {
		expanded.has(id) ? expanded.delete(id) : expanded.add(id);
		expanded = expanded;
	};
</script>

<div class="flex h-full flex-col">
	<div class="flex-shrink-0 border-b p-4">
		<h3 class="text-lg font-semibold">Files</h3>
	</div>

	<div class="flex-1 overflow-y-auto">
		<div class="space-y-1 p-2">
			{#each tree as n (n.id)}
				<Node node={n} {expanded} {selectedFileId} {onFileSelect} {toggle} />
			{/each}
		</div>
	</div>
</div>
