<script lang="ts">
	import { Shield, Zap, Sun, Moon } from 'lucide-svelte';
	import { Button } from '../ui/button/';
	import { toggleMode } from 'mode-watcher';
	import { page } from '$app/state';
	import type { NavigationItems } from '$lib/types/navigation';

	const navigationItems: NavigationItems = {
		dashboard: {
			label: 'Dashboard',
			path: '/'
		},
		projects: {
			label: 'Create Project',
			path: '/project/new'
		}
	};
</script>

<header class="bg-muted border-b px-6 py-4 shadow-sm">
	<div class="flex items-center justify-between">
		<a class="flex cursor-pointer items-center space-x-3" href="/">
			<div class="relative">
				<Shield class="h-8 w-8 text-blue-400" />
				<Zap class="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
			</div>
			<div>
				<h1
					class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent"
				>
					CodeGeist
				</h1>
				<p class="text-muted-foreground text-xs font-medium">Code Security Analysis</p>
			</div>
		</a>

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
