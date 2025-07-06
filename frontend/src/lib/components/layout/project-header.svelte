<script lang="ts">
	import type { Project, Scans } from '$lib/types/api';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Radar } from 'lucide-svelte';
	import { formatDateTime } from '$lib/utils/date.utils';
	import { formatFileSize } from '$lib/utils/file.utils';

	export let project: Project;
	export let isLoading: boolean = false;
	export let startScanHandler: () => void;
	export let selectedScan: Scans | null = null;

	$: showProgress =
		selectedScan && (selectedScan.status === 'running' || selectedScan.status === 'queued');
	$: progress = selectedScan?.progress ?? 0;
</script>

<section class="border-b">
	{#if showProgress}
		<div class="relative h-1 w-full bg-slate-200 dark:bg-slate-700">
			<div
				class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
				style="width: {progress}%"
			></div>
			{#if selectedScan?.status === 'running'}
				<div
					class="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent"
				></div>
			{/if}
		</div>
	{/if}

	<div class="px-6 py-4">
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
						{project.totalFiles ?? 0} files · {formatFileSize(project.totalSize as number)} · Uploaded&nbsp;at&nbsp;{formatDateTime(
							project.updatedAt
						)}
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
				{#if selectedScan?.status === 'running' || selectedScan?.status === 'queued'}
					<div class="flex items-center space-x-3">
						<div
							class="flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/20"
						>
							<div
								class="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
							></div>
							<span class="text-sm font-medium text-blue-700 dark:text-blue-300">
								{selectedScan.status === 'running'
									? `Analysis in Progress (${progress}%)`
									: 'Analysis Queued'}
							</span>
						</div>
						<div class="flex items-center space-x-1">
							<div class="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
							<div
								class="h-2 w-2 animate-pulse rounded-full bg-blue-400"
								style="animation-delay: 0.2s;"
							></div>
							<div
								class="h-2 w-2 animate-pulse rounded-full bg-blue-400"
								style="animation-delay: 0.4s;"
							></div>
						</div>
					</div>
				{:else}
					<Button onclick={startScanHandler} size="lg" class="font-semibold text-white">
						<Radar class="mr-1 h-4 w-4 " />
						Start Analysis
					</Button>
				{/if}
			{/if}
		</div>
	</div>
</section>
