<script lang="ts">
	import { FolderOpen, Shield, TrendingUp, Zap } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { DashboardAnalytics, ProjectsListing } from '@/lib/components/layout';
	import {
		projectsStore,
		hasProjectsStore,
		totalProjectsStore,
		projectsInitializedStore,
		projectActions
	} from '$lib/stores/project.store';

	$: projects = $projectsStore;
	$: hasProjects = $hasProjectsStore;
	$: totalProjects = $totalProjectsStore;
	$: isInitialized = $projectsInitializedStore;

	onMount(async () => {
		await projectActions.loadProjects();
	});
</script>

<svelte:head>
	<title>CodeGeist - Dashboard</title>
</svelte:head>

{#if !isInitialized}
	<div class="min-h-full">
		<div class="p-8">
			<DashboardAnalytics totalProjects={0} isLoading={true} />
			<ProjectsListing projects={[]} isLoading={true} />
		</div>
	</div>
{:else if !hasProjects}
	<div class="flex h-full items-center justify-center">
		<div class="text-center">
			<div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl">
				<FolderOpen class="h-12 w-12" />
			</div>
			<h3 class="mb-3 text-2xl font-bold">Welcome to CodeGeist</h3>
			<p class="text-muted-foreground mb-8 max-w-md leading-relaxed">
				Start your security journey by uploading your first code project. Our AI will analyze it to
				detect vulnerabilities and provide detailed insights.
			</p>
			<div class="text-muted-foreground flex items-center justify-center space-x-4 text-sm">
				<div class="flex items-center">
					<Zap class="mr-1 h-4 w-4" />
					AI Analysis
				</div>
				<div class="flex items-center">
					<Shield class="mr-1 h-4 w-4" />
					Security Focused
				</div>
				<div class="flex items-center">
					<TrendingUp class="mr-1 h-4 w-4" />
					Detailed Reports
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Data state -->
	<div class="min-h-full">
		<div class="p-8">
			<DashboardAnalytics {totalProjects} isLoading={false} />
			<ProjectsListing {projects} isLoading={false} />
		</div>
	</div>
{/if}
