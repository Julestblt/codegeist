<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { Shield, Zap, Home, Search } from 'lucide-svelte';
</script>

<div class="flex min-h-0 flex-1 items-center justify-center">
	<div class="mx-auto max-w-2xl px-6 text-center">
		<div class="relative mb-8">
			<div class="text-8xl font-bold text-slate-200 select-none md:text-9xl dark:text-slate-700">
				4&nbsp;&nbsp;4
			</div>
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="relative">
					<Shield class="h-20 w-20 animate-pulse text-blue-500 md:h-20 md:w-20" />
					<Zap
						class="absolute -top-2 -right-2 h-8 w-8 animate-bounce text-yellow-400 md:h-10 md:w-10"
					/>
				</div>
			</div>
		</div>

		<div class="mb-8">
			<h1 class="mb-4 text-3xl font-bold text-slate-900 md:text-4xl dark:text-slate-100">
				Page Not Found
			</h1>
			<p class="mb-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
				Oops! It seems this page has vanished into cyberspace. Maybe it was secured by our AI
				protection system?
			</p>
		</div>

		<div
			class="mb-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
		>
			<Button onclick={() => goto('/')} size="lg" class="w-full text-white sm:w-auto">
				<Home class="mr-2 h-5 w-5" />
				Back to Home
			</Button>
		</div>

		<div class="border-t border-slate-200 pt-8 dark:border-slate-700">
			<p class="mb-4 text-sm text-slate-500 dark:text-slate-400">Looking for something specific?</p>
			<div class="flex flex-wrap items-center justify-center gap-4 text-sm">
				<Button onclick={() => goto('/')} variant="link">
					<Search class="mr-1 h-4 w-4" />
					Dashboard
				</Button>
				<span class="text-slate-300 dark:text-slate-600">•</span>
				<Button onclick={() => goto('/project/new')} variant="link">
					<Search class="mr-1 h-4 w-4" />
					New Project
				</Button>
			</div>
		</div>

		<div
			class="absolute top-1/4 left-1/4 h-2 w-2 animate-ping rounded-full bg-blue-400 opacity-75"
		></div>
		<div class="absolute top-1/3 right-1/4 h-1 w-1 animate-pulse rounded-full bg-purple-400"></div>
		<div
			class="absolute bottom-1/4 left-1/3 h-1.5 w-1.5 animate-bounce rounded-full bg-yellow-400"
		></div>
	</div>
</div>
