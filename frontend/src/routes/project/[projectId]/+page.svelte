<script lang="ts">
	import { page } from '$app/state';
	import {
		getFileContent,
		getProjectById,
		startScan,
		getScanStatus,
		getScanResults
	} from '$lib/services/api';
	import type { FileNode, Manifest, Project, Scans, Vulnerability } from '$lib/types/api';
	import { AnalysisPanel, CodeViewer, FileExplorer, ProjectHeader } from '$lib/components/layout';
	import { createSkeletonProject } from '$lib/utils/skeleton.utils';
	import { onMount, onDestroy } from 'svelte';
	import { PanelLeftClose, PanelRightClose } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

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
	let pollingScanInterval: number | null = null;

	const mockProject = createSkeletonProject(projectId);

	const toggleFileExplorer = () => {
		isFileExplorerCollapsed = !isFileExplorerCollapsed;
	};

	const toggleAnalysisPanel = () => {
		isAnalysisPanelCollapsed = !isAnalysisPanelCollapsed;
	};

	const startPolling = () => {
		if (pollingScanInterval) {
			clearInterval(pollingScanInterval);
		}

		pollingScanInterval = setInterval(async () => {
			if (!selectedScan || !project) return;

			try {
				const scanStatus = await getScanStatus(selectedScan.id);

				if (
					scanStatus.status !== selectedScan.status ||
					scanStatus.progress !== selectedScan.progress
				) {
					selectedScan = { ...selectedScan, ...scanStatus };

					if (project.scans) {
						const scanIndex = project.scans.findIndex((scan) => scan.id === selectedScan?.id);
						if (scanIndex !== -1) {
							project.scans[scanIndex] = selectedScan;
						}
					}

					if (scanStatus.status === 'done' || scanStatus.status === 'failed') {
						stopPolling();

						if (scanStatus.status === 'done') {
							toast.success('Analysis completed', {
								description: 'Your project analysis has finished successfully.',
								duration: 3000
							});

							await refreshProjectData();
						} else if (scanStatus.status === 'failed') {
							toast.error('Analysis failed', {
								description: 'There was an error during the analysis process.',
								duration: 3000
							});
						}
					}
				}
			} catch (error) {
				console.error('Error polling scan status:', error);
				stopPolling();
			}
		}, 5000);
	};

	const stopPolling = () => {
		if (pollingScanInterval) {
			clearInterval(pollingScanInterval);
			pollingScanInterval = null;
		}
	};

	const refreshProjectData = async () => {
		if (!projectId) return;

		try {
			const updatedProject = await getProjectById(projectId);
			project = updatedProject;

			if (selectedScan && project.scans) {
				selectedScan = project.scans.find((scan) => scan.id === selectedScan?.id) || selectedScan;
			}

			if (selectedFile && selectedFileId) {
				await onFileSelect(selectedFile);
			}
		} catch (error) {
			console.error('Error refreshing project data:', error);
		}
	};

	onMount(async () => {
		try {
			project = await getProjectById(projectId);

			if (project.scans && project.scans.length > 0) {
				const runningScan = project.scans.find(
					(scan) => scan.status === 'queued' || scan.status === 'running'
				);

				if (runningScan) {
					console.log('Found running scan:', { id: runningScan.id, status: runningScan.status });
					selectedScan = runningScan;
					startPolling();
				} else {
					// Select the most recent scan (assuming scans are ordered by date)
					console.log('No running scan found, selecting most recent:', {
						id: project.scans[0]?.id,
						status: project.scans[0]?.status
					});
					selectedScan = project.scans[0] || null;
				}
			}
		} catch (error) {
			console.error('Erreur lors du chargement du projet:', error);
		} finally {
			isLoading = false;
		}
	});

	onDestroy(() => {
		stopPolling();
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

	const onScanChange = async (scanId: string | null) => {
		console.log('Page: onScanChange called with:', scanId);
		stopPolling();

		if (scanId && project) {
			selectedScan = project.scans?.find((scan) => scan.id === scanId) || null;
			console.log(
				'Page: selectedScan updated to:',
				selectedScan
					? {
							id: selectedScan.id,
							status: selectedScan.status,
							issuesLength: selectedScan.issues?.length || 0,
							totalIssues: selectedScan.results?.totalIssues || 0
						}
					: null
			);

			// If scan has no issues but should have some, fetch the detailed scan results
			if (
				selectedScan &&
				selectedScan.results?.totalIssues > 0 &&
				(!selectedScan.issues || selectedScan.issues.length === 0)
			) {
				console.log('Page: Fetching detailed scan results for:', scanId);
				try {
					const scanResultsResponse = await getScanResults(scanId);

					// Combine the scan data with the issues from the response
					const detailedScan = {
						...selectedScan,
						issues: scanResultsResponse.issues
					};

					console.log('Page: Received detailed scan results:', {
						id: detailedScan.id,
						issuesLength: detailedScan.issues?.length || 0
					});

					// Update the scan in project.scans with the detailed data
					if (project.scans) {
						const scanIndex = project.scans.findIndex((s) => s.id === scanId);
						if (scanIndex !== -1) {
							project.scans[scanIndex] = detailedScan;
						}
					}
					selectedScan = detailedScan;
				} catch (error) {
					console.error('Page: Error fetching detailed scan results:', error);
				}
			}

			if (selectedScan && (selectedScan.status === 'queued' || selectedScan.status === 'running')) {
				startPolling();
			}
		}
	};

	const startScanHandler = async () => {
		if (!project) return;
		try {
			const response = await startScan(project.id);
			if (response.scan) {
				toast.success('Scan started successfully', {
					description: 'Your project is now being analyzed for vulnerabilities.',
					duration: 3000
				});

				if (project.scans) {
					project.scans = [response.scan, ...project.scans];
				} else {
					project.scans = [response.scan];
				}

				selectedScan = response.scan;

				// Start polling for the new scan
				startPolling();
			}
		} catch (error) {
			console.error('Error starting scan:', error);
			toast.error('Failed to start scan', {
				description: 'An error occurred while starting the scan. Please try again later.',
				duration: 3000
			});
			return;
		}
	};

	$: console.log(
		'selectedScan changed:',
		selectedScan
			? {
					id: selectedScan.id,
					status: selectedScan.status,
					progress: selectedScan.progress
				}
			: null
	);
</script>

<svelte:head>
	<title>CodeGeist - {project?.name || 'Loading...'}</title>
</svelte:head>

<div class="flex h-full flex-col overflow-hidden">
	<ProjectHeader {selectedScan} {startScanHandler} project={project || mockProject} {isLoading} />

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
					currentSelectedScan={selectedScan}
					{onVulnerabilitySelect}
					{onScanChange}
					projectId={project?.id || null}
					onTogglePanel={toggleAnalysisPanel}
				/>
			{/if}
		</div>
	</div>
</div>
