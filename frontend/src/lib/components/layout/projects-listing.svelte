<script lang="ts">
	import type { Project } from '$lib/types/api';
	import { ProjectCard } from '../ui/project-card';
	import { createSkeletonProjects } from '$lib/utils/skeleton.utils';

	export let projects: Project[] = [];
	export let isLoading: boolean = false;

	const skeletonProjects = createSkeletonProjects(6);
</script>

{#if isLoading}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each skeletonProjects as project (project.id)}
			<ProjectCard {project} isLoading={true} />
		{/each}
	</div>
{:else}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each projects as project (project.id)}
			<ProjectCard {project} isLoading={false} />
		{/each}
	</div>
{/if}
