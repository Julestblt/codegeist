<script lang="ts">
	import { Activity } from 'lucide-svelte';
	import { Badge } from '../ui/badge';
	import { StatCard } from '../ui/stat-card';
	import { Skeleton } from '../ui/skeleton';
	import { getDashboardAnalytics } from '$lib/services/api';
	import type { DashboardAnalytics } from '$lib/types/api';
	import { createDashboardCards, DASHBOARD_CONFIG } from '$lib/utils/dashboard.utils';
	import { onMount } from 'svelte';

	export let totalProjects: number;
	export let isLoading: boolean = false;

	let dashBoardAnalytics: DashboardAnalytics | null = null;

	onMount(async () => {
		dashBoardAnalytics = await getDashboardAnalytics();
	});

	$: cards = createDashboardCards(totalProjects, dashBoardAnalytics);
</script>

{#if isLoading}
	<div class="mb-6 flex items-center justify-between">
		<div>
			<div class="relative mb-2">
				<h2 class="invisible text-3xl font-bold">{DASHBOARD_CONFIG.title}</h2>
				<Skeleton class="absolute inset-0" />
			</div>
			<div class="relative">
				<p class="invisible text-slate-500">
					{DASHBOARD_CONFIG.subtitle}
				</p>
				<Skeleton class="absolute inset-0" />
			</div>
		</div>
		<div class="relative">
			<Badge class="invisible px-4 py-2 select-none" variant={'outline'}>
				<Activity class="h-4 w-4" />
				<span class="text-sm font-medium">{DASHBOARD_CONFIG.badgeText}</span>
			</Badge>
			<Skeleton class="absolute inset-0 rounded-full" />
		</div>
	</div>
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
		{#each cards as { title, value, icon, iconColor }}
			<StatCard {title} {value} Icon={icon} {iconColor} size="lg" isLoading={true} />
		{/each}
	</div>
{:else}
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h2 class="mb-2 text-3xl font-bold">{DASHBOARD_CONFIG.title}</h2>
			<p class="text-slate-500">
				{DASHBOARD_CONFIG.subtitle}
			</p>
		</div>
		<Badge class="px-4 py-2 select-none" variant={'outline'}>
			<Activity class="mr-1 h-4 w-4" />
			<span class="text-sm font-medium">{DASHBOARD_CONFIG.badgeText}</span>
		</Badge>
	</div>
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
		{#each cards as { title, value, icon, iconColor }}
			<StatCard {title} {value} Icon={icon} {iconColor} size="lg" isLoading={false} />
		{/each}
	</div>
{/if}
