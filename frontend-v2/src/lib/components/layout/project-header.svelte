<script lang="ts">
	import type { Project } from '$lib/types/api';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Radar } from 'lucide-svelte';

	export let project: Project;
	export let isLoading: boolean = false;

	const startScanHandler = () => {
		console.log('Starting scan for project:', project.id);
	};
</script>

<section class="border-b px-6 py-4">
	<div class="flex items-center justify-between">
		{#if isLoading}
			<div>
				<Skeleton class="mb-1 h-7 w-64" />
				<Skeleton class="mb-1 h-5 w-80" />
			</div>

			<Skeleton class="h-10 w-24 rounded" />
		{:else}
			<div>
				<h2 class="text-xl font-semibold">{project.name}</h2>

				<p class="text-muted-foreground text-sm">
					{project.totalFiles ?? 0} files · {project.totalSize} · Uploaded&nbsp;at&nbsp;
					{project.updatedAt}
				</p>
				{#if project.url}
					<a
						href={project.url}
						target="_blank"
						rel="noreferrer"
						class="text-primary text-xs hover:underline"
					>
						{project.url.replace(/^https?:\/\//, '')}
					</a>
				{/if}
			</div>

			<Button onclick={startScanHandler} size="lg" class="font-semibold text-white">
				<Radar class="mr-1 h-4 w-4 " />
				Start Analysis
			</Button>
		{/if}
	</div>
</section>
