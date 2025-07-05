<script lang="ts">
	import type { Project } from '$lib/types/api';
	import { ProjectCard } from '../ui/project-card';

	export let projects: Project[] = [];
	export let isLoading: boolean = false;

	// Données mock pour les skeletons avec dimensions correctes
	const skeletonProjects: Project[] = Array(6)
		.fill(null)
		.map((_, index) => ({
			id: `skeleton-${index}`,
			name: 'Project Name Placeholder',
			createdAt: '2024-01-01T00:00:00Z',
			totalFiles: 123,
			totalSize: 45678,
			description: 'Description placeholder',
			status: 'active' as const,
			updatedAt: '2024-01-01T00:00:00Z'
		}));
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
