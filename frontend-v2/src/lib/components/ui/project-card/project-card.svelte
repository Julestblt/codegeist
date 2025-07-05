<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Project } from '$lib/types/api';
	import { Calendar, HardDrive, FileText, FolderOpen, Settings } from 'lucide-svelte';
	import * as Dropdown from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { stopPropagation } from '$lib/utils/button.utils';
	import { deleteProject } from '$lib/services/api';
	import { projectActions } from '$lib/stores/project.store';

	export let project: Partial<Project> = {
		id: '',
		name: '',
		createdAt: '',
		totalFiles: 0,
		totalSize: 0
	};
	export let isLoading: boolean = false;

	const handleDeleteProject = async () => {
		if (!project.id) return;

		try {
			await deleteProject(project.id);

			projectActions.removeProject(project.id);
		} catch (error) {
			console.error('Erreur lors de la suppression du projet:', error);
		}
	};
</script>

<a href={isLoading ? '#' : `/project/${project.id}`} class={isLoading ? 'pointer-events-none' : ''}>
	<Card.Root class="hover:border-primary group cursor-pointer shadow-sm hover:shadow-lg">
		<Card.Content class="p-6">
			<div class="mb-4 flex items-start justify-between">
				<div class="flex w-full items-center justify-between">
					<div class="flex w-full items-center space-x-3">
						<Badge variant={'secondary'} class="flex h-12 w-12 items-center justify-center p-3">
							{#if isLoading}
								<Skeleton class="h-6 w-6 rounded" />
							{:else}
								<FolderOpen class="!h-full !w-full" />
							{/if}
						</Badge>
						{#if isLoading}
							<Skeleton class="h-5 w-32" />
						{:else}
							<h3 class="font-semibold">{project.name}</h3>
						{/if}
					</div>
					{#if isLoading}
						<Skeleton class="h-8 w-8 rounded" />
					{:else}
						<Dropdown.Root>
							<Dropdown.Trigger>
								<Button variant={'outline'}>
									<Settings class="h-4 w-4" />
								</Button>
							</Dropdown.Trigger>
							<Dropdown.Content>
								<Dropdown.Item>
									<AlertDialog.Root>
										<AlertDialog.Trigger onclick={stopPropagation}>
											<Button variant="ghost">Delete Project</Button>
										</AlertDialog.Trigger>

										<AlertDialog.Content onclick={stopPropagation}>
											<AlertDialog.Header>
												<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
												<AlertDialog.Description>
													This action cannot be undone. This will permanently delete your project
													and remove all its data.
												</AlertDialog.Description>
											</AlertDialog.Header>

											<AlertDialog.Footer>
												<AlertDialog.Cancel onclick={stopPropagation}>Cancel</AlertDialog.Cancel>

												<AlertDialog.Action class="text-foreground" onclick={handleDeleteProject}
													>Continue</AlertDialog.Action
												>
											</AlertDialog.Footer>
										</AlertDialog.Content>
									</AlertDialog.Root>
								</Dropdown.Item>
							</Dropdown.Content>
						</Dropdown.Root>
					{/if}
				</div>
			</div>
			<div class="mb-4 space-y-3">
				<div class="text-muted-foreground flex items-center text-sm">
					{#if isLoading}
						<Skeleton class="mr-2 h-4 w-4 rounded" />
						<Skeleton class="h-4 w-24" />
					{:else}
						<Calendar class="mr-2 h-4 w-4" />
						{project.createdAt}
					{/if}
				</div>
				<div class="text-muted-foreground flex items-center text-sm">
					{#if isLoading}
						<Skeleton class="mr-2 h-4 w-4 rounded" />
						<Skeleton class="h-4 w-16" />
					{:else}
						<FileText class="mr-2 h-4 w-4" />
						{project.totalFiles} files
					{/if}
				</div>
				<div class="text-muted-foreground flex items-center text-sm">
					{#if isLoading}
						<Skeleton class="mr-2 h-4 w-4 rounded" />
						<Skeleton class="h-4 w-12" />
					{:else}
						<HardDrive class="mr-2 h-4 w-4" />
						{project.totalSize as number}
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</a>
