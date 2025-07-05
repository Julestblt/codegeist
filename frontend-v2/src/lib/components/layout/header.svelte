<script lang="ts">
	import { Shield, Zap, Sun, Moon } from 'lucide-svelte';
	import { Button } from '../ui/button/';
	import { toggleMode, mode } from 'mode-watcher';
	import { page } from '$app/state';
	import type { NavigationItems } from '$lib/types/navigation';

	const navigationItems: NavigationItems = {
		dashboard: {
			label: 'Dashboard',
			path: '/'
		},
		projects: {
			label: 'Create Project',
			path: '/project/create'
		}
	};
</script>

<header class="bg-background border-b px-6 py-4 shadow-sm">
	<div class="flex items-center justify-between">
		<div class="flex cursor-pointer items-center space-x-3">
			<div class="relative">
				<Shield fill={mode.current === 'dark' ? '#ffffff' : '#000000'} class="h-8 w-8 " />
				<Zap fill="#155dfc" class="text-primary absolute -top-0.5 -right-0.5 h-4 w-4" />
			</div>
			<div>
				<h1 class="bg-clip-text text-2xl font-bold">CodeGeist</h1>
				<p class="text-muted-foreground text-xs font-medium">Code Security Analysis</p>
			</div>
		</div>

		<nav class="flex items-center space-x-1">
			{#each Object.entries(navigationItems) as [_, { label, path }]}
				<Button
					class={page.url.pathname === path ? 'text-white' : ''}
					href={path}
					variant={page.url.pathname === path ? 'default' : 'ghost'}
				>
					{label}
				</Button>
			{/each}
		</nav>

		<div class="flex items-center space-x-3">
			<Button onclick={toggleMode} variant="ghost" size="icon">
				<Sun class="absolute hidden h-5 w-5 dark:block" />
				<Moon class="absolute block h-5 w-5 dark:hidden" />
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</div>
</header>
