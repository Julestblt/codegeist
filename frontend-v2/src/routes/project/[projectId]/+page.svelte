<script lang="ts">
	import { page } from '$app/state';
	import { getFileContent, getProjectById } from '$lib/services/api';
	import type { FileNode, Manifest, Project, Scans } from '$lib/types/api';
	import { CodeViewer, FileExplorer, ProjectHeader } from '$lib/components/layout';
	import { createSkeletonProject } from '$lib/utils/skeleton.utils';
	import { onMount } from 'svelte';

	const projectId = page.params.projectId;

	let project: Project | null = null;
	let isLoading = true;
	let fileContent: string = '';
	let selectedFile: FileNode | null = null;
	let selectedFileId: string | undefined = undefined;
	let selectedFilePath: string | null = null;
	let selectedScan: Scans | null = null;

	const mockProject = createSkeletonProject(projectId);

	onMount(async () => {
		try {
			project = await getProjectById(projectId);

			selectedScan = project?.scans?.[0] || null;
		} catch (error) {
			console.error('Erreur lors du chargement du projet:', error);
		} finally {
			isLoading = false;
		}
	});

	const onFileSelect = async (file: FileNode) => {
		if (!project || !file.id) return;

		selectedFile = file;
		selectedFileId = file.id;
		selectedFilePath = file.name;

		try {
			const result = await getFileContent(project.id, file.id);
			fileContent = result.content || '';
		} catch (error) {
			console.error('Erreur lors du chargement du fichier:', error);
			fileContent = '';
		}
	};
</script>

<svelte:head>
	<title>CodeGeist - {project?.name || 'Loading...'}</title>
</svelte:head>

<div class="flex h-full flex-col overflow-hidden">
	<ProjectHeader project={project || mockProject} {isLoading} />

	<div class="flex min-h-0 flex-1 overflow-hidden">
		<div class="flex w-80 flex-shrink-0 flex-col overflow-hidden border-r">
			<FileExplorer {selectedFileId} {onFileSelect} files={project?.manifest as Manifest[]} />
		</div>
		<div class="flex flex-1 flex-col overflow-hidden">
			<CodeViewer
				file={selectedFile}
				path={selectedFilePath}
				projectId={project?.id}
				{fileContent}
				{selectedScan}
			/>
		</div>
	</div>
</div>
