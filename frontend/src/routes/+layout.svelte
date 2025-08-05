<script lang="ts">
	import { Layout } from '@/lib/components/layout';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.store';

	let { children } = $props();

	onMount(() => {
		authStore.init();
	});
</script>

<ModeWatcher />
<Toaster />
<Layout>
	{@render children()}
</Layout>
