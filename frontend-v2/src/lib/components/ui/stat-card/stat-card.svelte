<script lang="ts">
	import { Badge } from '../badge';
	import { Skeleton } from '../skeleton';
	import type { ComponentType } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	export let title: string = '';
	export let value: string | number = '';
	export let Icon: ComponentType | null = null;
	export let iconColor: string = '';
	export let titleColor: string = '';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let isLoading: boolean = false;

	const sizeClasses = {
		sm: {
			padding: 'px-4',
			titleText: 'text-xs',
			valueText: 'text-sm',
			iconSize: 'w-6 h-6',
			iconPadding: 'p-1.5'
		},
		md: {
			padding: 'px-6 py-1',
			titleText: 'text-xs',
			valueText: 'text-lg',
			iconSize: 'w-8 h-8',
			iconPadding: 'p-2'
		},
		lg: {
			padding: 'px-6 py-2',
			titleText: 'text-sm',
			valueText: 'text-xl',
			iconSize: 'w-10 h-10',
			iconPadding: 'p-2.5'
		}
	};

	const classes = sizeClasses[size];
</script>

<Card.Root class="w-full">
	<Card.Content class={classes.padding}>
		<div class={`flex items-center ${Icon ? 'justify-between' : 'justify-center'} gap-2`}>
			<div class={`${!Icon ? 'text-center' : 'flex-1'}`}>
				{#if isLoading}
					<Skeleton class={`mb-1 h-4 w-24`} />
					<Skeleton class={`h-6 w-16`} />
				{:else}
					<p class={`${classes.titleText} font-medium text-pretty ${titleColor || ''}`}>
						{title}
					</p>
					<p class={`${classes.valueText} font-bold `}>{value}</p>
				{/if}
			</div>
			{#if Icon}
				{#if isLoading}
					<Skeleton class={`${classes.iconSize} rounded`} />
				{:else}
					<Badge
						class={`${classes.iconSize} flex items-center justify-center ${classes.iconPadding}`}
						variant={'outline'}
					>
						<svelte:component this={Icon} class={`${iconColor} !h-full !w-full`} />
					</Badge>
				{/if}
			{/if}
		</div>
	</Card.Content>
</Card.Root>
