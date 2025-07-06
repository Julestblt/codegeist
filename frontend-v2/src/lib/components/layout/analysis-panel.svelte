<script lang="ts">
	import {
		Info,
		CheckCircle,
		Clock,
		Filter,
		XCircle,
		AlertCircle,
		AlertTriangle,
		SearchCode,
		PanelRightClose
	} from 'lucide-svelte';
	import type { Severity, Vulnerability } from '$lib/types/api';
	import type { Scans } from '$lib/types/api';
	import { StatCard } from '$lib/components/ui/stat-card/';
	import * as Select from '$lib/components/ui/select/';
	import { Button } from '../ui/button';

	export let onVulnerabilitySelect: (vulnerability: Vulnerability) => void;
	export let onScanChange: ((scanId: string | null) => void) | undefined = undefined;
	export let onTogglePanel: (() => void) | undefined = undefined;
	export let scans: Scans[];
	export let projectId: string | null = null;

	let selectedSeverity = 'all';
	let expandedVuln: string | null = null;
	let selectedScan: Scans | null = null;
	let selectedScanId = '';

	const severityOptions = [
		{ value: 'all', label: 'All Severities' },
		{ value: 'critical', label: 'Critical' },
		{ value: 'high', label: 'High' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'low', label: 'Low' }
	];

	$: selectedSeverityLabel =
		severityOptions.find((opt) => opt.value === selectedSeverity)?.label ?? 'Select severity';
	$: selectedScanLabel = selectedScan
		? `${
				selectedScan.status === 'completed'
					? '✅'
					: selectedScan.status === 'running'
						? '🔄'
						: selectedScan.status === 'failed'
							? '❌'
							: '⏳'
			} ${
				selectedScan.finishedAt
					? new Date(selectedScan.finishedAt).toLocaleDateString() +
						' ' +
						new Date(selectedScan.finishedAt).toLocaleTimeString()
					: selectedScan.startedAt
						? new Date(selectedScan.startedAt).toLocaleDateString() +
							' ' +
							new Date(selectedScan.startedAt).toLocaleTimeString()
						: 'Unknown'
			}`
		: 'Select scan';

	$: {
		const latestCompletedScan = scans
			.filter((scan) => scan.status === 'completed' && scan.finishedAt)
			.sort((a, b) => {
				const dateA = new Date(a.finishedAt!);
				const dateB = new Date(b.finishedAt!);
				return dateB.getTime() - dateA.getTime();
			})[0];

		selectedScan = latestCompletedScan || scans[0] || null;
		selectedScanId = selectedScan?.id || '';

		if (onScanChange) {
			onScanChange(latestCompletedScan?.id || scans[0]?.id || null);
		}
	}

	function handleVulnerabilityClick(vuln: Vulnerability) {
		onVulnerabilitySelect(vuln);
		expandedVuln = expandedVuln === vuln.id ? null : vuln.id;
	}

	$: if (selectedScanId && scans.length > 0) {
		const scan = scans.find((s) => s.id === selectedScanId);
		if (scan && scan !== selectedScan) {
			selectedScan = scan;
			if (onScanChange) {
				onScanChange(selectedScanId);
			}
		}
	}

	$: filteredIssues =
		selectedScan?.issues?.filter(
			(issue) => selectedSeverity === 'all' || issue.severity.toLowerCase() === selectedSeverity
		) || [];

	$: severityStats = {
		critical: {
			title: 'Critical',
			count: selectedScan?.results?.issuesBySeverity?.critical || 0,
			color: 'text-red-600'
		},
		high: {
			title: 'High',
			count: selectedScan?.results?.issuesBySeverity?.high || 0,
			color: 'text-orange-600'
		},
		medium: {
			title: 'Medium',
			count: selectedScan?.results?.issuesBySeverity?.medium || 0,
			color: 'text-yellow-600'
		},
		low: {
			title: 'Low',
			count: selectedScan?.results?.issuesBySeverity?.low || 0,
			color: 'text-blue-600'
		}
	};
</script>

{#if scans.length === 0}
	<div class="text-foreground flex h-full items-center justify-center border-l">
		<div class="text-center">
			<Clock class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
			<p class="text-lg font-medium">No analysis available</p>
			<p class="text-muted-foreground text-sm">
				Start a scan to see security analysis results here.
			</p>
		</div>
	</div>
{:else}
	<div class="flex h-full flex-col border-l">
		<div class="flex-shrink-0 border-b p-4">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Security Analysis</h3>
				{#if onTogglePanel}
					<Button variant="ghost" onclick={onTogglePanel} title="Rétracter le panneau d'analyse">
						<PanelRightClose />
					</Button>
				{/if}
			</div>

			<div class="mb-2 grid grid-cols-2 gap-3">
				<div
					class="bg-card flex h-fit items-center justify-between rounded-lg border p-3 shadow-sm"
				>
					<p class="text-sm">Total Issues</p>
					<p class="text-xl font-bold">{selectedScan?.results?.totalIssues || 0}</p>
				</div>
				<div
					class="bg-card flex h-fit items-center justify-between rounded-lg border p-3 shadow-sm"
				>
					<p class="text-sm">Scanned Files</p>
					<p class="text-xl font-bold">{selectedScan?.results?.scannedFiles || 0}</p>
				</div>
			</div>

			<div class="mb-4 grid grid-cols-4 gap-2">
				{#each Object.entries(severityStats) as [key, { count, color, title }]}
					<button
						class="bg-card rounded-lg border p-3 text-center shadow-sm transition-colors"
						onclick={() => {
							selectedSeverity = key;
							expandedVuln = null;
						}}
					>
						<div class="text-2xl font-bold {color}">{count}</div>
						<div class="mt-1 text-xs text-gray-600 dark:text-gray-400">{title}</div>
					</button>
				{/each}
			</div>

			<div class="mb-2 flex items-center space-x-2">
				<Filter class="text-muted-foreground h-4 w-4" />
				<Select.Root type="single" bind:value={selectedSeverity}>
					<Select.Trigger class="w-[180px]">
						{selectedSeverityLabel}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Severity</Select.Label>
							{#each severityOptions as option (option.value)}
								<Select.Item value={option.value} label={option.label}>
									{option.label}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex items-center space-x-2">
				<SearchCode class="text-muted-foreground h-4 w-4" />
				<Select.Root type="single" bind:value={selectedScanId}>
					<Select.Trigger class="w-[280px]">
						{selectedScanLabel}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Scans</Select.Label>
							{#each scans as scan (scan.id)}
								<Select.Item value={scan.id} label={scan.id}>
									{scan.status === 'completed'
										? '✅'
										: scan.status === 'running'
											? '🔄'
											: scan.status === 'failed'
												? '❌'
												: '⏳'}
									{scan.finishedAt
										? new Date(scan.finishedAt).toLocaleDateString() +
											' ' +
											new Date(scan.finishedAt).toLocaleTimeString()
										: scan.startedAt
											? new Date(scan.startedAt).toLocaleDateString() +
												' ' +
												new Date(scan.startedAt).toLocaleTimeString()
											: 'Unknown'}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto">
			{#if filteredIssues.length === 0}
				<div class="p-8 text-center">
					<CheckCircle class="mx-auto mb-4 h-12 w-12 text-green-500" />
					<p class="text-muted-foreground text-lg font-medium">No issues found</p>
					<p class="text-muted-foreground text-sm">
						{selectedSeverity === 'all'
							? 'Your code looks secure!'
							: `No ${selectedSeverity} severity issues found.`}
					</p>
				</div>
			{:else}
				<div class="space-y-3 p-4">
					{#each filteredIssues as issue (issue.id)}
						<button
							class="w-full cursor-pointer rounded-lg border p-4 text-left transition-all hover:shadow-md {issue.severity ===
							'CRITICAL'
								? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
								: issue.severity === 'HIGH'
									? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
									: issue.severity === 'MEDIUM'
										? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
										: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'}"
							onclick={() =>
								handleVulnerabilityClick({
									id: issue.id,
									description: issue.description,
									severity: issue.severity.toLowerCase() as Severity,
									filePath: issue.filePath,
									lines: issue.lines,
									recommendation: issue.recommendation,
									cwe: issue.cwe && issue.cwe !== 'null' ? issue.cwe : undefined,
									type: issue.type,
									scanId: selectedScanId,
									projectId: projectId || ''
								})}
						>
							<div class="flex items-start space-x-3">
								<div class="min-w-0 flex-1">
									<div class="flex items-start space-x-3">
										<div class="mt-0.5 h-5 w-5 flex-shrink-0">
											{#if issue.severity === 'CRITICAL'}
												<XCircle class="h-5 w-5 text-red-600" />
											{:else if issue.severity === 'HIGH'}
												<AlertCircle class="h-5 w-5 text-orange-600" />
											{:else if issue.severity === 'MEDIUM'}
												<AlertTriangle class="h-5 w-5 text-yellow-600" />
											{:else}
												<Info class="h-5 w-5 text-blue-600" />
											{/if}
										</div>
										<div class="min-w-0 flex-1">
											<div class="flex items-center justify-between">
												<h4 class="truncate text-sm font-medium">
													{issue.type}
												</h4>
											</div>
											<p class="text-muted-foreground mt-1 text-sm font-thin">
												{issue.description}
											</p>
											<div class="text-muted-foreground mt-2 flex items-center space-x-4 text-xs">
												<span class="truncate">{issue.filePath}</span>
												<span class="whitespace-nowrap">
													{issue.lines.length === 1 ? 'Line' : 'Lines'}{' '}
													{issue.lines.join(', ')}
												</span>
												{#if issue.cwe !== 'null'}
													<span>{issue.cwe}</span>
												{/if}
											</div>
										</div>
									</div>

									{#if expandedVuln === issue.id}
										<div class="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
											<div class="space-y-2">
												<div>
													<h5 class="text-xs font-medium text-gray-900 dark:text-gray-100">
														Recommendation:
													</h5>
													<p class="text-xs text-gray-700 dark:text-gray-300">
														{issue.recommendation}
													</p>
												</div>
											</div>
										</div>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
