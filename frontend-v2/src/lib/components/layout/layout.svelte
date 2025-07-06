<script lang="ts">
	import { page } from '$app/state';
	import { Header } from './';

	let { children } = $props();

	console.log('Page URL:', page.url.pathname);
</script>

{#if page.url.pathname.startsWith('/project/') && page.url.pathname !== '/project/new'}
	<div class="flex h-screen flex-col overflow-hidden">
		<Header />
		<div class="flex-1 overflow-hidden">{@render children()}</div>
	</div>
{:else}
	<div class="flex min-h-screen flex-col overflow-y-auto">
		<Header />
		<div class="flex flex-1 flex-col overflow-hidden">
			{@render children()}
		</div>
	</div>
{/if}
