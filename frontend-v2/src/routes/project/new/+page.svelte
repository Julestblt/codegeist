<script lang="ts">
	import { AlertCircle, FileArchive, FolderOpen, Github, Globe, Upload, X } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button/';
	import { Input } from '$lib/components/ui/input';
	import { createProject, uploadProjectZip } from '$lib/services/api';
	import { projectActions } from '$lib/stores';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { formatFileSize } from '$lib/utils/file.utils';

	let gitUrl: string = '';
	let projectName: string = '';
	let errorMessage: string = '';
	let selectedFile: File | null = null;
	let fileInputRef: HTMLInputElement;
	let isDragOver = false;

	const handleFileSelect = (file: File) => {
		if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
			selectedFile = file;
			projectName = file.name.replace('.zip', '').replace(/[-_]/g, ' ');
			errorMessage = '';
		} else {
			errorMessage = 'Please select a ZIP file';
		}
	};

	const handleFileInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			handleFileSelect(target.files[0]);
		}
	};

	const handleDrop = (event: DragEvent) => {
		event.preventDefault();
		isDragOver = false;

		if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
			handleFileSelect(event.dataTransfer.files[0]);
		}
	};

	const handleDragOver = (event: DragEvent) => {
		event.preventDefault();
		isDragOver = true;
	};

	const handleDragLeave = (event: DragEvent) => {
		event.preventDefault();
		isDragOver = false;
	};

	const removeFile = () => {
		selectedFile = null;
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	};

	const openFileDialog = () => {
		fileInputRef?.click();
	};

	const handleCreateProject = async () => {
		if (!selectedFile) return (errorMessage = 'Please select a ZIP file');

		if (!projectName.trim()) return (errorMessage = 'Please enter a project name');

		try {
			const id = await createProject(projectName, gitUrl || null);
			const { project } = await uploadProjectZip(id, selectedFile);

			if (project) {
				projectActions.addProject(project);
				toast.success('Project created successfully !', {
					description: 'Redirecting you to the dashboard',
					duration: 3000
				});
				setTimeout(() => {
					goto('/');
				}, 3000);
			}
		} catch (error) {
			console.error('Error creating project:', error);
			errorMessage = 'Failed to create project. Please try again.';
		}
	};

	$: if (projectName || selectedFile) errorMessage = '';
</script>

<div class="flex flex-1 items-center justify-center py-8">
	<div class="mx-auto w-full max-w-5xl">
		<Card.Root class="gap-0 overflow-hidden border py-0 shadow-xl">
			<Card.Header class="bg-primary p-0">
				<div class="px-8 py-6">
					<div class="flex items-center space-x-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
							<FolderOpen class="h-6 w-6 text-white" />
						</div>
						<div>
							<h3 class="text-2xl font-bold text-white">New Project</h3>
							<p class="text-blue-100">Upload and configure your project in one step</p>
						</div>
					</div>
				</div>
			</Card.Header>

			<Card.Content class="p-0">
				<div class="grid grid-cols-1 gap-0 lg:grid-cols-2">
					<div class="bg-gray-50 p-8 dark:bg-gray-800/50">
						<h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
							1. Select your file
						</h4>

						<div
							class={`group relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
								isDragOver
									? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-300 hover:border-blue-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-700/50'
							}`}
							on:drop={handleDrop}
							on:dragover={handleDragOver}
							on:dragleave={handleDragLeave}
							on:click={openFileDialog}
							role="button"
							tabindex="0"
							on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
						>
							<div class="space-y-4">
								<div
									class="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 transition-all duration-300 group-hover:from-blue-200 group-hover:to-purple-200 dark:from-blue-900/50 dark:to-purple-900/50 dark:group-hover:from-blue-800/50 dark:group-hover:to-purple-800/50"
								>
									<FileArchive class="h-8 w-8 text-blue-600 dark:text-blue-400" />
								</div>

								<div>
									<p class="mb-2 font-medium text-gray-900 dark:text-gray-100">
										{isDragOver ? 'Drop your ZIP file here' : 'Drag and drop your ZIP file'}
									</p>
									<p class="mb-4 text-sm text-gray-600 dark:text-gray-400">or click to browse</p>

									<Button variant="outline" size="sm" class="hover:scale-105">
										<Upload class="mr-2 h-4 w-4" />
										Browse
									</Button>
								</div>
							</div>
						</div>

						<div class="mt-4 h-16">
							{#if selectedFile}
								<div
									class="flex h-full rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
								>
									<div class="flex w-full items-center justify-between">
										<div class="flex items-center space-x-3">
											<div
												class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50"
											>
												<FileArchive class="h-5 w-5 text-green-600 dark:text-green-400" />
											</div>
											<div>
												<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
													{selectedFile.name}
												</p>
												<p class="text-xs text-gray-600 dark:text-gray-400">
													{formatFileSize(selectedFile.size)}
												</p>
											</div>
										</div>
										<Button variant="ghost" size="icon" onclick={removeFile} class="h-8 w-8">
											<X class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{:else}
								<div class="h-full"></div>
							{/if}
						</div>

						<div class="mt-6 space-y-3">
							<div class="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
								<div
									class="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50"
								>
									<FileArchive class="h-3 w-3 text-green-600 dark:text-green-400" />
								</div>
								<span>ZIP archives supported</span>
							</div>
							<div class="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
								<div
									class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50"
								>
									<Globe class="h-3 w-3 text-blue-600 dark:text-blue-400" />
								</div>
								<span>Up to 100MB</span>
							</div>
						</div>
					</div>

					<div class="p-8">
						<h4 class="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
							2. Configure your project
						</h4>

						<div class="space-y-6">
							<div class="space-y-3">
								<label
									for="projectName"
									class="block text-sm font-semibold text-gray-900 dark:text-gray-100"
								>
									Project Name *
								</label>
								<div class="relative">
									<Input
										id="projectName"
										type="text"
										bind:value={projectName}
										placeholder="Enter your project name"
										class="h-12 rounded-xl pr-12"
										required
									/>
									<div class="absolute inset-y-0 right-0 flex items-center pr-4">
										<FolderOpen class="h-5 w-5 text-gray-400" />
									</div>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									Choose a descriptive name for your project
								</p>
							</div>

							<div class="space-y-3">
								<label
									for="gitUrl"
									class="block text-sm font-semibold text-gray-900 dark:text-gray-100"
								>
									Git Repository URL
									<span class="ml-1 font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
								</label>
								<div class="relative">
									<Input
										id="gitUrl"
										type="url"
										bind:value={gitUrl}
										placeholder="https://github.com/username/repository"
										class="h-12 rounded-xl pl-12"
									/>
									<div class="absolute inset-y-0 left-0 flex items-center pl-4">
										<Github class="h-5 w-5 text-gray-400" />
									</div>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									Link to your repository for better tracking
								</p>
							</div>

							<div class="pt-4">
								<Button class="w-full text-white" onclick={handleCreateProject} size="lg">
									<Upload class="mr-2 h-5 w-5" />
									Create project
								</Button>
							</div>
						</div>
						{#if errorMessage}
							<div class="mt-4">
								<Alert.Root variant="destructive">
									<AlertCircle class="h-4 w-4" />
									<Alert.Title>Error</Alert.Title>
									<Alert.Description>
										{errorMessage}
									</Alert.Description>
								</Alert.Root>
							</div>
						{/if}
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<input
			bind:this={fileInputRef}
			type="file"
			accept=".zip"
			on:change={handleFileInput}
			class="hidden"
		/>
	</div>
</div>
