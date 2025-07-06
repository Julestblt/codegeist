<script lang="ts">
	import { page } from '$app/state';
	import { getFileContent, getProjectById } from '$lib/services/api';
	import type { FileNode, Manifest, Project, Scans, Vulnerability } from '$lib/types/api';
	import { AnalysisPanel, CodeViewer, FileExplorer, ProjectHeader } from '$lib/components/layout';
	import { createSkeletonProject } from '$lib/utils/skeleton.utils';
	import { onMount } from 'svelte';
	import { PanelLeftClose, PanelRightClose } from 'lucide-svelte';

	const projectId = page.params.projectId;

	let project: Project | null = null;
	let isLoading = true;
	let fileContent: string = '';
	let selectedFile: FileNode | null = null;
	let selectedFileId: string | undefined = undefined;
	let selectedFilePath: string | null = null;
	let selectedScan: Scans | null = null;
	let highlightLine: number | null = null;
	let isFileExplorerCollapsed = false;
	let isAnalysisPanelCollapsed = false;

	const mockProject = createSkeletonProject(projectId);

	const toggleFileExplorer = () => {
		isFileExplorerCollapsed = !isFileExplorerCollapsed;
	};

	const toggleAnalysisPanel = () => {
		isAnalysisPanelCollapsed = !isAnalysisPanelCollapsed;
	};

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
		highlightLine = null;

		try {
			const result = await getFileContent(project.id, file.id);
			fileContent = result.content || '';
		} catch (error) {
			console.error('Erreur lors du chargement du fichier:', error);
			fileContent = '';
		}
	};

	const onVulnerabilitySelect = async (vulnerability: Vulnerability) => {
		if (!project) return;

		const targetFile = project.manifest?.find(
			(manifest) => manifest.path === vulnerability.filePath
		);

		if (targetFile) {
			const targetLine = vulnerability.lines[0] || null;
			if (selectedFileId === vulnerability.filePath) {
				highlightLine = targetLine;
				return;
			}

			const mockFileNode: FileNode = {
				id: vulnerability.filePath,
				name: vulnerability.filePath.split('/').pop() || vulnerability.filePath,
				type: 'file',
				size: 0
			};

			selectedFile = mockFileNode;
			selectedFileId = vulnerability.filePath;
			selectedFilePath = vulnerability.filePath;
			highlightLine = targetLine;

			try {
				const result = await getFileContent(project.id, vulnerability.filePath);
				fileContent = result.content || '';
			} catch (error) {
				console.error('Erreur lors du chargement du fichier:', error);
				fileContent = '';
			}
		}
	};

	const onScanChange = (scanId: string | null) => {
		if (scanId && project) {
			selectedScan = project.scans?.find((scan) => scan.id === scanId) || null;
		}
	};
</script>

<svelte:head>
	<title>CodeGeist - {project?.name || 'Loading...'}</title>
</svelte:head>

<div class="flex h-full flex-col overflow-hidden">
	<ProjectHeader project={project || mockProject} {isLoading} />

	<div class="flex min-h-0 flex-1 overflow-hidden">
		<div
			class={`flex flex-shrink-0 flex-col overflow-hidden border-r transition-all duration-300 ${
				isFileExplorerCollapsed ? 'w-12' : 'w-80'
			}`}
		>
			{#if isFileExplorerCollapsed}
				<div class="bg-muted/50 flex h-full items-center justify-center">
					<button
						on:click={toggleFileExplorer}
						class="bg-background hover:bg-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors"
						title="Ouvrir l'explorateur de fichiers"
					>
						<PanelLeftClose size={16} />
					</button>
				</div>
			{:else}
				<FileExplorer
					{selectedFileId}
					{onFileSelect}
					files={project?.manifest as Manifest[]}
					onTogglePanel={toggleFileExplorer}
				/>
			{/if}
		</div>

		<div class="flex flex-1 flex-col overflow-hidden">
			<CodeViewer
				file={selectedFile}
				path={selectedFilePath}
				projectId={project?.id}
				{fileContent}
				{selectedScan}
				{highlightLine}
			/>
		</div>

		<div
			class={`flex flex-shrink-0 flex-col overflow-hidden border-l transition-all duration-300 ${
				isAnalysisPanelCollapsed ? 'w-12' : 'w-96'
			}`}
		>
			{#if isAnalysisPanelCollapsed}
				<div class="bg-muted/50 flex h-full items-center justify-center">
					<button
						on:click={toggleAnalysisPanel}
						class="bg-background hover:bg-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors"
						title="Ouvrir le panneau d'analyse"
					>
						<PanelRightClose size={16} />
					</button>
				</div>
			{:else}
				<AnalysisPanel
					scans={project?.scans || []}
					{onVulnerabilitySelect}
					{onScanChange}
					projectId={project?.id || null}
					onTogglePanel={toggleAnalysisPanel}
				/>
			{/if}
		</div>
	</div>
</div>
