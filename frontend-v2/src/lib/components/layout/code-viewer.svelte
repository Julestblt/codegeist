<script lang="ts">
	import { afterUpdate } from 'svelte';
	import { Info } from 'lucide-svelte';
	import type { FileNode, Scans, Vulnerability } from '$lib/types/api';
	import { getVulnerabilitiesForFile } from '@/lib/services/api';
	import { getSeverityIcon, getSeverityColor } from '$lib/utils/style.utils';

	export let file: FileNode | null = null;
	export const path: string | null = null;
	export let projectId: string | null = null;
	export let highlightLine: number | null = null;
	export let selectedScan: Scans | null = null;
	export let fileContent: string = '';

	let loading = false;
	let vulnerabilities: Vulnerability[] = [];
	let codeContainerRef: HTMLDivElement;

	$: lines = fileContent.split('\n');

	function scrollToHighlightedLine() {
		if (highlightLine && codeContainerRef) {
			const lineElement = codeContainerRef.querySelector(`[data-line-number="${highlightLine}"]`);
			if (lineElement) {
				lineElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			}
		}
	}

	function getLineVulnerabilities(lineNo: number): Vulnerability[] {
		if (!vulnerabilities || vulnerabilities.length === 0) {
			return [];
		}

		const result = vulnerabilities.filter((v) => {
			if (!v.lines || v.lines.length === 0) return false;

			if (v.lines.includes(lineNo)) return true;

			if (v.lines.length === 2) {
				const [start, end] = v.lines.sort((a, b) => a - b);
				return lineNo >= start && lineNo <= end;
			}

			return false;
		});

		return result;
	}

	function getVulnerabilitiesToShow(lineNo: number): Vulnerability[] {
		return vulnerabilities.filter((v) => {
			const maxLine = Math.max(...v.lines);
			return maxLine === lineNo;
		});
	}

	afterUpdate(() => {
		if (highlightLine && fileContent) {
			setTimeout(scrollToHighlightedLine, 100);
		}
	});

	$: if (fileContent && file && projectId) {
		getVulnerabilities();
	}

	const getVulnerabilities = async () => {
		if (!projectId || !file?.id) return;

		loading = true;
		try {
			const fileVulnerabilities = await getVulnerabilitiesForFile(
				projectId,
				file?.id,
				selectedScan?.id
			);

			vulnerabilities = fileVulnerabilities || [];
			console.log('Vulnérabilités chargées:', vulnerabilities);
			console.log('Nombre total de vulnérabilités:', vulnerabilities.length);

			vulnerabilities.forEach((vuln, index) => {
				console.log(`Vulnérabilité ${index + 1}:`, {
					id: vuln.id,
					lines: vuln.lines,
					type: vuln.type,
					severity: vuln.severity
				});
			});
		} catch (error) {
			console.error('Erreur lors du chargement des vulnérabilités:', error);
			vulnerabilities = [];
		} finally {
			loading = false;
		}
	};
</script>

{#if !file}
	<div class="flex h-full items-center justify-center">
		<div class="text-center">
			<Info class="mx-auto mb-4 h-12 w-12 text-gray-400" />
			<p class="text-lg font-medium">Select a file to view its content</p>
			<p class="text-muted-foreground text-sm">
				Choose a file from the explorer to start code review
			</p>
		</div>
	</div>
{:else}
	<div class="flex h-full flex-col">
		<div class="border-b p-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold">{file.id}</h3>
				</div>
				{#if vulnerabilities.length > 0}
					<div class="flex items-center space-x-2">
						<span class="text-sm font-medium">
							{vulnerabilities.length} issue{vulnerabilities.length !== 1 ? 's' : ''} found
						</span>
						<span class="relative flex size-3">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"
							></span>
							<span class="relative inline-flex size-3 rounded-full bg-red-500"></span>
						</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="flex-1 overflow-hidden">
			{#if loading}
				<div class="flex h-full items-center justify-center">
					<div class="flex items-center space-x-2">
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
						></div>
						<span class="text-muted-foreground text-sm">Loading...</span>
					</div>
				</div>
			{:else}
				<div class="h-full overflow-y-auto" bind:this={codeContainerRef}>
					<div class="h-full overflow-x-hidden overflow-y-auto">
						<div class="text-sm">
							{#each lines as line, idx}
								{@const lineNo = idx + 1}
								{@const lineVulns = getLineVulnerabilities(lineNo)}
								{@const hasVulns = lineVulns.length > 0}
								{@const isHighlighted = highlightLine === lineNo}
								{@const vulnsToShow = getVulnerabilitiesToShow(lineNo)}

								<div class="flex" data-line-number={lineNo}>
									<div
										class="w-12 border-r px-2 py-1 text-right text-xs select-none {isHighlighted
											? 'bg-primary/30'
											: hasVulns
												? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
												: 'bg-muted text-muted-foreground'}"
									>
										{lineNo}
									</div>

									<div
										class="flex-1 px-4 py-1 font-mono break-words whitespace-pre-wrap {isHighlighted
											? 'bg-primary/10'
											: hasVulns
												? 'bg-red-50 dark:bg-red-900/20'
												: ''}"
									>
										<code class={hasVulns ? 'text-red-900 dark:text-red-100' : ''}
											>{line || ' '}</code
										>

										{#if vulnsToShow.length > 0}
											<div class="mt-2 space-y-2">
												{#each vulnsToShow as vuln}
													{@const iconInfo = getSeverityIcon(vuln.severity)}
													{@const colorClass = getSeverityColor(vuln.severity)}
													<div class="rounded-lg border p-3 {colorClass}">
														<div class="flex items-start space-x-2">
															<svelte:component
																this={iconInfo.component}
																class="h-4 w-4 {iconInfo.class}"
															/>
															<div class="flex-1">
																<h4 class="font-medium">{vuln.type}</h4>
																<p class="text-sm">{vuln.description}</p>
																<p class="mt-2 text-xs">
																	<span class="font-medium">Fix:</span>
																	{vuln.recommendation}
																</p>
																{#if vuln.cwe && vuln.cwe !== 'null'}
																	<span
																		class="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
																	>
																		{vuln.cwe}
																	</span>
																{/if}
																<div class="text-muted-foreground mt-2 text-xs">
																	<span class="font-medium">Lines:</span>
																	{vuln.lines.join(', ')}
																</div>
															</div>
														</div>
													</div>
												{/each}
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
