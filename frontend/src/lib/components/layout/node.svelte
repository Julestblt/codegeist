<script lang="ts">
	import type { FileNode } from '$lib/types/api';
	import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-svelte';
	import { fmtSize } from '$lib/utils/file-explorer.utils';

	export let node: FileNode;
	export let depth: number = 0;
	export let selectedFileId: string | undefined = undefined;
	export let expanded: Set<string>;

	export let onFileSelect: (file: FileNode) => void;
	export let toggle: (id: string) => void;

	$: isDir = node.type === 'folder';
	$: isOpen = expanded.has(node.id);
	$: isSelected = selectedFileId === node.id;
	$: indent = depth * 20 + 8;
</script>

<div>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={`flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left transition-colors ${
			isSelected ? 'bg-primary text-white' : ''
		}`}
		style:padding-left="{indent}px"
		on:click={() => (isDir ? toggle(node.id) : onFileSelect(node))}
	>
		{#if isDir}
			<div class="mr-1 h-4 w-4 flex-shrink-0">
				{#if isOpen}
					<ChevronDown class="text-muted-foreground h-4 w-4" />
				{:else}
					<ChevronRight class="text-muted-foreground h-4 w-4" />
				{/if}
			</div>
		{/if}

		<div class="mr-2 h-4 w-4 flex-shrink-0">
			{#if isDir}
				{#if isOpen}
					<FolderOpen class="text-primary h-4 w-4" />
				{:else}
					<Folder class="text-primary h-4 w-4" />
				{/if}
			{:else}
				<File class="h-4 w-4" />
			{/if}
		</div>

		<span class="truncate text-sm">{node.name}</span>

		{#if !isDir && node.size}
			<span class="ml-auto text-xs">{fmtSize(node.size)}</span>
		{/if}
	</div>

	{#if isDir && isOpen && node.children}
		<div>
			{#each node.children as child (child.id)}
				<svelte:self
					node={child}
					depth={depth + 1}
					{expanded}
					{selectedFileId}
					{onFileSelect}
					{toggle}
				/>
			{/each}
		</div>
	{/if}
</div>
